// import { sendToExplorerLLM } from './services';
import './style.css';

// --- Types & Configuration ---
type State = 'idle' | 'loading' | 'result' | 'error';

// The input format received from the API (as described in the requirements)
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

// --- UI Elements ---
const elStateIdle = document.getElementById('state-idle') as HTMLElement;
const elStateLoading = document.getElementById('state-loading') as HTMLElement;
const elStateResult = document.getElementById('state-result') as HTMLElement;
const elStateError = document.getElementById('state-error') as HTMLElement;

const btnGenerate = document.getElementById('btn-generate') as HTMLButtonElement;
const btnCopy = document.getElementById('btn-copy') as HTMLButtonElement;
const copyLabel = document.getElementById('copy-label') as HTMLSpanElement;
const btnRegenerate = document.getElementById('btn-regenerate') as HTMLButtonElement;
const btnRetry = document.getElementById('btn-retry') as HTMLButtonElement;

const markdownOutput = document.getElementById('markdown-output') as HTMLElement;
const creditsCount = document.getElementById('credits-count') as HTMLElement;

const step1 = document.getElementById('step-1') as HTMLElement;
const step2 = document.getElementById('step-2') as HTMLElement;
const step3 = document.getElementById('step-3') as HTMLElement;

// --- State Management ---
let currentState: State = 'idle';
let credits = 5;

function transitionTo(state: State) {
  currentState = state;

  // Hide all state panels
  [elStateIdle, elStateLoading, elStateResult, elStateError].forEach(el => {
    el.classList.remove('active');
  });

  // Show target state panel
  if (state === 'idle') {
    elStateIdle.classList.add('active');
  } else if (state === 'loading') {
    elStateLoading.classList.add('active');
  } else if (state === 'result') {
    elStateResult.classList.add('active');
  } else if (state === 'error') {
    elStateError.classList.add('active');
  }
}

// --- Premium Markdown Parser ---
function renderMarkdown(markdown: string): string {
  let html = markdown;

  // Escape HTML tags inside code blocks first to prevent breaking structure
  html = html.replace(/```(typescript|javascript|json|html|css)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre><code class="language-${lang || 'txt'}">${escapedCode}</code></pre>`;
  });

  // Format headers with icons or simple text
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');

  // Format task lists with a custom class for styling & interactive checks
  // Matches: - [ ] **filename** -> description
  html = html.replace(/^- \[ \] \*\*(.*?)\*\* -> (.*?)$/gim, (_, file, desc) => {
    return `<li><span class="markdown-checkbox" aria-label="Toggle task"></span><strong>${file}</strong> &rarr; ${desc}</li>`;
  });

  // Matches: - [ ] description
  html = html.replace(/^- \[ \] (.*?)$/gim, (_, desc) => {
    return `<li><span class="markdown-checkbox" aria-label="Toggle task"></span>${desc}</li>`;
  });

  // Process sections to ensure proper structure (p & ul)
  const blocks = html.split('\n\n');
  const processedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h2>') || trimmed.startsWith('<pre>') || trimmed.startsWith('<li>')) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  });

  let joinedHtml = processedBlocks.join('\n');

  // Group consecutive <li> tags in a single <ul> wrapper
  joinedHtml = joinedHtml.replace(/(<li>.*?<\/li>)+/gs, (match) => {
    return `<ul>${match}</ul>`;
  });

  return joinedHtml;
}

// --- Action Implementations ---

// Mocking the generation sequence (UI demo/interaction workflow)
async function startPlanGeneration() {
  transitionTo('loading');

  // Reset steps classes
  [step1, step2, step3].forEach(step => {
    step.className = 'loading-step';
  });

  try {
    // Step 1: Scanning repository tree
    step1.classList.add('active');
    // const result = await sendToExplorerLLM()
    await new Promise(resolve => setTimeout(resolve, 1000));
    step1.classList.remove('active');
    step1.classList.add('completed');

    // Step 2: ExplorerLLM identifying files
    step2.classList.add('active');
    await new Promise(resolve => setTimeout(resolve, 1200));
    step2.classList.remove('active');
    step2.classList.add('completed');

    // Step 3: PlannerLLM generating plan
    step3.classList.add('active');
    await new Promise(resolve => setTimeout(resolve, 1400));
    step3.classList.remove('active');
    step3.classList.add('completed');

    // Render & display
    displayPlan(SAMPLE_PLAN);
    
    // Decrement credits
    if (credits > 0) {
      credits--;
      creditsCount.textContent = credits.toString();
    }
  } catch (error) {
    console.error('Plan generation failed', error);
    transitionTo('error');
  }
}

function displayPlan(planMarkdown: string) {
  markdownOutput.innerHTML = renderMarkdown(planMarkdown);
  transitionTo('result');

  // Attach click listener for custom interactive checkboxes inside markdown plan
  const checkboxes = markdownOutput.querySelectorAll('.markdown-checkbox');
  checkboxes.forEach(cb => {
    cb.addEventListener('click', (e) => {
      e.stopPropagation();
      cb.classList.toggle('checked');
    });
  });
}

function copyPlanToClipboard() {
  // Use plain text for clipboard
  const tempTextarea = document.createElement('textarea');
  tempTextarea.value = SAMPLE_PLAN;
  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  document.execCommand('copy');
  document.body.removeChild(tempTextarea);

  // Success Feedback Animation
  btnCopy.style.borderColor = 'var(--success-color)';
  btnCopy.style.color = 'var(--success-color)';
  copyLabel.textContent = 'Copied!';
  
  setTimeout(() => {
    btnCopy.style.borderColor = '';
    btnCopy.style.color = '';
    copyLabel.textContent = 'Copy';
  }, 2000);
}

// --- Event Listeners ---
btnGenerate.addEventListener('click', startPlanGeneration);
btnRegenerate.addEventListener('click', startPlanGeneration);
btnRetry.addEventListener('click', startPlanGeneration);
btnCopy.addEventListener('click', copyPlanToClipboard);

// Export hooks to window so user can easily hook their chrome extension listener logic
(window as any).RootIssueUI = {
  transitionTo,
  displayPlan,
  getCurrentState: () => currentState,
  setCredits: (count: number) => {
    credits = count;
    creditsCount.textContent = count.toString();
  },
  setDetectedIssue: (title: string, repo: string, number: string) => {
    const issueTitleEl = document.getElementById('issue-title');
    const repoTagEl = document.querySelector('.repo-tag');
    const issueNumberEl = document.querySelector('.issue-number');
    
    if (issueTitleEl) issueTitleEl.textContent = title;
    if (repoTagEl) {
      repoTagEl.innerHTML = `
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        ${repo}
      `;
    }
    if (issueNumberEl) issueNumberEl.textContent = `#${number}`;
  },
  setRepositoryFiles: (files: string[]) => {
    const displayEl = document.getElementById('file-tree-display');
    const countEl = document.getElementById('file-count');
    if (displayEl) displayEl.textContent = files.join(', ');
    if (countEl) countEl.textContent = `${files.length} files`;
  }
};
