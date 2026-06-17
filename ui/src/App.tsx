import { useState, useEffect } from 'react';
import { getActiveTabUrl, parseGitHubIssueUrl, fetchIssueDetails, fetchRepoTree } from './services/github';
import { getSettings, saveSettings, generateUUID, getCachedPlan, setCachedPlan, getGenerationStatus, setGenerationStatus, type UserSettings, type GenerationStatus } from './utils/storage';
import type { State, IssueContext } from './types';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { IssueContextCard } from './components/IssueContextCard';

// Views
import { OnboardingView } from './components/views/OnboardingView';
import { IdleView } from './components/views/IdleView';
import { LoadingView } from './components/views/LoadingView';
import { ResultView } from './components/views/ResultView';
import { ErrorView } from './components/views/ErrorView';

const SAMPLE_PLAN = `## 🎯 Problem
The current chat implementation is hardcoded to a single provider, limiting model choice and quality.

## 🛠️ Solution
Abstract chat providers behind an interface and implement a factory for dynamic selection.

## 📋 Execution Steps
- [ ] **package.json** -> Add \`@google/generative-ai\` and \`@anthropic-ai/sdk\`.
- [ ] **src/providers/types.ts** -> Define \`ChatProvider\` interface.
- [ ] **src/providers/openai.ts** -> Implement OpenAI provider.
- [ ] **src/providers/anthropic.ts** -> Implement Anthropic provider.
- [ ] **src/providers/gemini.ts** -> Implement Gemini provider.
- [ ] **src/providers/factory.ts** -> Create provider factory function.
- [ ] **src/botService.ts** -> Inject and use the provider factory.

## 💻 Code Architecture
\`\`\`typescript
interface ChatProvider {
 generate(prompt: string): Promise<string>;
}
// Factory function to return appropriate provider instance
\`\`\`
`;

export default function App() {
  const [currentState, setCurrentState] = useState<State>('idle');
  const [credits, setCredits] = useState(5);
  const [globalSettings, setGlobalSettings] = useState<UserSettings>({});
  
  const [activeIssueContext, setActiveIssueContext] = useState<IssueContext | null>(null);
  const [repoFiles, setRepoFiles] = useState<string[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState('');
  
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize extension settings
  useEffect(() => {
    const init = async () => {
      const settings = await getSettings();
      if (!settings.userId) {
        settings.userId = generateUUID();
        settings.credits = 5;
        settings.plan = 'free';
        await saveSettings(settings);
      }

      setCredits(settings.credits ?? 5);
      setGlobalSettings(settings);

      if (!settings.githubToken && settings.isPrivate !== false) {
        setCurrentState('onboarding');
      } else {
        setCurrentState('idle');
        prepareIdleState(settings);
      }
    };
    init();
  }, []);

  // Listen to background generation updates and sync popup state
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes.generationStatus) {
        const newStatus = changes.generationStatus.newValue as GenerationStatus | undefined;
        if (newStatus && activeIssueContext) {
          const issueKey = `${activeIssueContext.owner}/${activeIssueContext.repo}#${activeIssueContext.issueNumber}`;
          if (newStatus.issueKey === issueKey) {
            if (newStatus.status === 'loading') {
              setCurrentState('loading');
              setLoadingStep(newStatus.step);
            } else if (newStatus.status === 'success') {
              setGeneratedPlan(newStatus.plan || SAMPLE_PLAN);
              setCurrentState('result');
            } else if (newStatus.status === 'error') {
              setCurrentState('error');
            }
          }
        }
      } else if (areaName === 'sync' && changes.credits) {
        setCredits((changes.credits.newValue as number) ?? 5);
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }

    return () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
    };
  }, [activeIssueContext]);

  const prepareIdleState = async (settings: UserSettings) => {
    try {
      const url = await getActiveTabUrl();
      if (url) {
        const parsed = parseGitHubIssueUrl(url);
        if (parsed) {
          const details = await fetchIssueDetails(parsed.owner, parsed.repo, parsed.issueNumber, settings.githubToken);
          const issueContext = { ...parsed, ...details };
          setActiveIssueContext(issueContext);
          
          const files = await fetchRepoTree(parsed.owner, parsed.repo, settings.githubToken);
          setRepoFiles(files);

          const issueKey = `${parsed.owner}/${parsed.repo}#${parsed.issueNumber}`;

          // Check if there is currently a background generation task running for this issue
          const backgroundStatus = await getGenerationStatus();
          if (backgroundStatus && backgroundStatus.issueKey === issueKey) {
            if (backgroundStatus.status === 'loading') {
              setCurrentState('loading');
              setLoadingStep(backgroundStatus.step);
              return;
            } else if (backgroundStatus.status === 'error') {
              setCurrentState('error');
              return;
            }
          }

          // Restore plan if it was previously cached in the current session
          const cacheKey = `plan:${parsed.owner}/${parsed.repo}#${parsed.issueNumber}`;
          const cachedPlan = await getCachedPlan(cacheKey);
          if (cachedPlan) {
            setGeneratedPlan(cachedPlan);
            setCurrentState('result');
          }
        } else {
          console.warn("Not a GitHub issue URL:", url);
        }
      } else {
        console.warn("Could not get active tab URL. Make sure 'tabs' permission is enabled.");
      }
    } catch (err: any) {
      console.error("Failed to fetch issue context or tree:", err);
      setErrorMessage(err.message || "Failed to fetch issue context.");
      setCurrentState('error');
    }
  };

  const handleSaveToken = async (tokenInput: string, scopePrivate: boolean) => {
    const updatedToken = tokenInput || globalSettings.githubToken;
    const newSettings = { ...globalSettings, githubToken: updatedToken, isPrivate: scopePrivate };
    setGlobalSettings(newSettings);
    await saveSettings(newSettings);
    
    setCurrentState('idle');
    prepareIdleState(newSettings);
  };

  const startPlanGeneration = async () => {
    if (!activeIssueContext) {
      alert("Please open a GitHub issue to generate a plan.");
      return;
    }

    if (credits <= 0) {
      alert("You have 0 credits remaining.");
      return;
    }

    setCurrentState('loading');
    setLoadingStep(1);

    const issueKey = `${activeIssueContext.owner}/${activeIssueContext.repo}#${activeIssueContext.issueNumber}`;
    await setGenerationStatus({
      status: 'loading',
      step: 1,
      issueKey
    });

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'START_PLAN_GENERATION',
        payload: {
          activeIssueContext,
          repoFiles,
          globalSettings,
          credits
        }
      });
    } else {
      // Fallback for dev mode where extension APIs are missing
      console.log("Dev environment detected: simulating background generation");
      setTimeout(async () => {
        await setGenerationStatus({ status: 'loading', step: 2, issueKey });
        setLoadingStep(2);
        setTimeout(async () => {
          await setGenerationStatus({ status: 'loading', step: 3, issueKey });
          setLoadingStep(3);
          setTimeout(async () => {
            const mockPlan = SAMPLE_PLAN;
            const cacheKey = `plan:${activeIssueContext.owner}/${activeIssueContext.repo}#${activeIssueContext.issueNumber}`;
            await setCachedPlan(cacheKey, mockPlan);
            await setGenerationStatus({ status: 'success', step: 3, issueKey, plan: mockPlan });
            setGeneratedPlan(mockPlan);
            setCurrentState('result');
          }, 1500);
        }, 1500);
      }, 1500);
    }
  };

  return (
    <div id="app">
      <Header credits={credits} />

      {currentState !== 'onboarding' && <IssueContextCard context={activeIssueContext} />}

      {currentState === 'onboarding' && (
        <OnboardingView 
          hasExistingToken={!!globalSettings.githubToken}
          existingIsPrivate={!!globalSettings.isPrivate}
          onSaveToken={handleSaveToken} 
        />
      )}
      {currentState === 'idle' && <IdleView repoFiles={repoFiles} onGeneratePlan={startPlanGeneration} />}
      {currentState === 'loading' && <LoadingView loadingStep={loadingStep} />}
      {currentState === 'result' && <ResultView generatedPlan={generatedPlan || SAMPLE_PLAN} onRegenerate={startPlanGeneration} />}
      {currentState === 'error' && <ErrorView onRetry={startPlanGeneration} errorMessage={errorMessage} />}

      <Footer onSettingsClick={() => setCurrentState('onboarding')} />
    </div>
  );
}
