

interface IdleViewProps {
  repoFiles: string[];
  onGeneratePlan: () => void;
}

export function IdleView({ repoFiles, onGeneratePlan }: IdleViewProps) {
  return (
    <div id="state-idle" className="state-panel active">
      <div className="file-tree-preview" id="file-tree-preview">
        <div className="file-tree-header">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Repository context</span>
          <span className="file-count-badge" id="file-count">{repoFiles.length} files</span>
        </div>
        <p className="file-tree-value" id="file-tree-display">
          {repoFiles.length > 0 ? repoFiles.slice(0, 5).join(', ') + (repoFiles.length > 5 ? '...' : '') : 'No files loaded'}
        </p>
      </div>

      <button className="btn-generate" id="btn-generate" aria-label="Generate Implementation Plan" onClick={onGeneratePlan}>
        <span className="btn-generate-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="btn-generate-text">Generate Implementation Plan</span>
        <span className="btn-generate-shimmer"></span>
      </button>

      <p className="idle-hint">RootIssue will analyze this issue and generate a step-by-step plan.</p>
    </div>
  );
}
