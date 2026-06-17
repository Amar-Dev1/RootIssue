import { useState } from 'react';

interface OnboardingViewProps {
  hasExistingToken: boolean;
  existingIsPrivate: boolean;
  onSaveToken: (token: string, isPrivate: boolean) => void;
}

export function OnboardingView({ hasExistingToken, existingIsPrivate, onSaveToken }: OnboardingViewProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [scopePrivate, setScopePrivate] = useState(existingIsPrivate);

  const handleSave = () => {
    const trimmedToken = tokenInput.trim();

    // Logical check: If they don't have a token saved and the input is empty, block them
    if (!trimmedToken && !hasExistingToken) {
      alert("Please enter a GitHub Access Token to connect your account.");
      return;
    }

    // Validation: Check pattern of Github token if they are changing it
    if (trimmedToken) {
      const isValidPrefix = trimmedToken.startsWith('ghp_') || trimmedToken.startsWith('github_pat_');
      if (!isValidPrefix && trimmedToken.length < 20) {
        alert("Please enter a valid GitHub token (should start with 'ghp_' or 'github_pat_').");
        return;
      }
    }

    onSaveToken(trimmedToken, scopePrivate);
  };

  return (
    <div id="state-onboarding" className="state-panel active">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="var(--accent-color)" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="var(--accent-color)" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="var(--accent-color)" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          <h2>Welcome to RootIssue</h2>
          <p>Configure your settings and connect your GitHub account to analyze repositories.</p>
        </div>

        {hasExistingToken && (
          <div className="token-status-banner">
            <div className="status-dot success"></div>
            <span>GitHub account connected (Token configured)</span>
          </div>
        )}
        
        <div className="input-group">
          <label htmlFor="github-token">GitHub Access Token</label>
          <input 
            type="password" 
            id="github-token" 
            placeholder={hasExistingToken ? "•••••••••••••••••••• (Saved - enter new to update)" : "ghp_xxxxxxxxxxxxxxxxxxxx"} 
            autoComplete="off" 
            spellCheck="false" 
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
          />
          <a href="https://github.com/settings/tokens/new?description=RootIssue+Extension&scopes=repo" target="_blank" className="help-link" rel="noopener noreferrer">Generate token</a>
        </div>

        <div className="scope-selector">
          <label className="radio-label">
            <input 
              type="radio" 
              name="token-scope" 
              value="public" 
              checked={!scopePrivate} 
              onChange={() => setScopePrivate(false)}
            />
            <div className="radio-custom"></div>
            <div className="radio-text">
              <span className="radio-title">Public Repositories</span>
              <span className="radio-desc">Read-only access to public code</span>
            </div>
          </label>
          <label className="radio-label">
            <input 
              type="radio" 
              name="token-scope" 
              value="private" 
              checked={scopePrivate}
              onChange={() => setScopePrivate(true)}
            />
            <div className="radio-custom"></div>
            <div className="radio-text">
              <span className="radio-title">Private Repositories</span>
              <span className="radio-desc">Requires 'repo' scope</span>
            </div>
          </label>
        </div>

        <button className="btn-generate" id="btn-save-token" onClick={handleSave}>
          <span className="btn-generate-text">{hasExistingToken ? "Save Settings" : "Connect Account"}</span>
        </button>
      </div>
    </div>
  );
}
