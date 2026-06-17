

interface ErrorViewProps {
  onRetry: () => void;
  errorMessage?: string;
}

export function ErrorView({ onRetry, errorMessage }: ErrorViewProps) {
  return (
    <div id="state-error" className="state-panel active">
      <div className="error-container">
        <div className="error-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="error-title">Something went wrong</p>
        <p className="error-message" id="error-message">
          {errorMessage || "Failed to reach the RootIssue API. Please try again."}
        </p>
        <button className="btn-retry" id="btn-retry" onClick={onRetry}>Try Again</button>
      </div>
    </div>
  );
}
