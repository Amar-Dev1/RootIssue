import { useState, useEffect } from "react";
import {
  parseGitHubIssueUrl,
  fetchIssueDetails,
  fetchRepoTree,
  fetchFilesContent,
} from "./services/github";
import { getSettings, saveSettings, type UserSettings } from "./utils/storage";
import { SendToExplorerLLM, SendToPlannerLLM } from "./services/index";

// Components
import { Header } from "./components/Header";
import { ConfigPanel } from "./components/views/ConfigPanel";
import { LoadingView } from "./components/views/LoadingView";
import { ResultView } from "./components/views/ResultView";
import { ErrorView } from "./components/views/ErrorView";
import type { IssueContext } from "./types";

export default function App() {
  const [globalSettings, setGlobalSettings] = useState<UserSettings>({});

  // Right side state
  const [rightPanelState, setRightPanelState] = useState<
    "idle" | "loading" | "result" | "error"
  >("idle");
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize settings
  useEffect(() => {
    const init = async () => {
      const settings = await getSettings();
      if (settings.credits === undefined) {
        settings.credits = 3;
        await saveSettings({ credits: 3 });
      }
      setGlobalSettings(settings);

      // Restore session state
      if (settings.panelState) setRightPanelState(settings.panelState);
      if (settings.loadingStep) setLoadingStep(settings.loadingStep);
      if (settings.generatedPlan) setGeneratedPlan(settings.generatedPlan);
      if (settings.errorMessage) setErrorMessage(settings.errorMessage);
    };
    init();
  }, []);

  const handleSaveSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...globalSettings, ...newSettings };
    setGlobalSettings(updated);
    await saveSettings(newSettings);
  };

  const updatePanelState = (
    newState: "idle" | "loading" | "result" | "error",
    step?: number,
    plan?: string,
    error?: string,
  ) => {
    setRightPanelState(newState);
    if (step !== undefined) setLoadingStep(step);
    if (plan !== undefined) setGeneratedPlan(plan);
    if (error !== undefined) setErrorMessage(error);

    const newSettings: Partial<UserSettings> = { panelState: newState };
    if (step !== undefined) newSettings.loadingStep = step;
    if (plan !== undefined) newSettings.generatedPlan = plan;
    if (error !== undefined) newSettings.errorMessage = error;

    handleSaveSettings(newSettings);
  };

  const startPlanGeneration = async (issueUrl: string) => {
    if (!globalSettings.githubToken) {
      alert("Please configure a GitHub Access Token first.");
      return;
    }

    updatePanelState("loading", 1, "", "");

    try {
      const parsed = parseGitHubIssueUrl(issueUrl);
      if (!parsed) {
        throw new Error("Invalid GitHub issue URL format.");
      }

      // Fetch issue context
      const details = await fetchIssueDetails(
        parsed.owner,
        parsed.repo,
        parsed.issueNumber,
        globalSettings.githubToken,
      );
      const issueContext: IssueContext = { ...parsed, ...details };

      // Explore Tree to find target files
      const treeFiles = await fetchRepoTree(
        parsed.owner,
        parsed.repo,
        globalSettings.githubToken,
      );
      const explorerContext = `\n\n${treeFiles.join(", ")}`;

      // Resolve effective credentials — credits mode always wins over stale dropdown values
      const isCreditsMode = !globalSettings.apiKey;
      const effectiveProvider = isCreditsMode ? "google" : globalSettings.provider;
      const effectiveModel = isCreditsMode ? "gemini-2.5-flash-lite" : globalSettings.model;
      const effectiveApiKey = isCreditsMode
        ? import.meta.env.VITE_GEMINI_API_KEY
        : globalSettings.apiKey;

      // Guard: credits mode requires the env key to be baked in at build time
      if (!effectiveApiKey) {
        throw new Error(
          isCreditsMode
            ? "Free credits are unavailable: the deployment is missing VITE_GEMINI_API_KEY. Please use your own API key."
            : "No API key provided. Please enter your LLM API key in settings."
        );
      }

      const explorerResult = await SendToExplorerLLM(
        issueContext.fullText,
        explorerContext,
        effectiveProvider,
        effectiveModel,
        effectiveApiKey,
      );


      if (!explorerResult || !explorerResult.result) {
        throw new Error("Explorer model failed to return target files.");
      }

      const filesToFetch =
        typeof explorerResult.result === "string"
          ? explorerResult.result.split(",").map((f: string) => f.trim())
          : explorerResult.result;

      updatePanelState("loading", 2);

      const filesContentArr = await fetchFilesContent(
        parsed.owner,
        parsed.repo,
        filesToFetch,
        globalSettings.githubToken,
      );
      const filesContentStr = filesContentArr
        .map((f) => `--- ${f.path} ---\n${f.content}\n`)
        .join("\n\n");

      updatePanelState("loading", 3);

      const planResult = await SendToPlannerLLM(
        issueContext.fullText,
        filesContentStr,
        effectiveProvider,
        effectiveModel,
        effectiveApiKey,
      );

      const newPlan =
        typeof planResult?.result === "string"
          ? planResult.result
          : planResult?.plan || "";

      if (!newPlan) {
        throw new Error("Planner model failed to generate a plan.");
      }

      // If no API key was used, decrement credits
      if (
        !globalSettings.apiKey &&
        globalSettings.credits &&
        globalSettings.credits > 0
      ) {
        await handleSaveSettings({ credits: globalSettings.credits - 1 });
      }

      updatePanelState("result", 0, newPlan);
    } catch (err: any) {
      console.error("Generation error:", err);
      updatePanelState(
        "error",
        0,
        "",
        err.message || "An unexpected error occurred.",
      );
    }
  };

  return (
    <div className="web-app-container">
      <Header credits={globalSettings.credits || 0} />

      <main
        className={rightPanelState === "idle" ? "centered-view" : "split-view"}
      >
        <section
          className={rightPanelState === "idle" ? "center-panel" : "left-panel"}
        >
          <ConfigPanel
            settings={globalSettings}
            onSaveSettings={handleSaveSettings}
            onGeneratePlan={startPlanGeneration}
            isLoading={rightPanelState === "loading"}
          />
        </section>

        {rightPanelState !== "idle" && (
          <section className="right-panel">
            {rightPanelState === "loading" && (
              <LoadingView loadingStep={loadingStep} />
            )}
            {rightPanelState === "result" && (
              <ResultView
                generatedPlan={generatedPlan}
                onRegenerate={() => updatePanelState("idle", 0, "")}
              />
            )}
            {rightPanelState === "error" && (
              <ErrorView
                onRetry={() => updatePanelState("idle", 0, "")}
                errorMessage={errorMessage}
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
}
