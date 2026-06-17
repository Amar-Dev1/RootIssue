

interface HeaderProps {
  credits: number;
}

export function Header({ credits }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="brand-name">RootIssue</span>
      </div>
      <div className="header-meta" id="credits-badge">
        <span className="credits-icon">⚡</span>
        <span id="credits-count">{credits}</span>
        <span className="credits-label">credits</span>
      </div>
    </header>
  );
}
