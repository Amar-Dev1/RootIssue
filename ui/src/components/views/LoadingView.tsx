

interface LoadingViewProps {
  loadingStep: number;
}

const STEPS = [
  { id: 1, label: 'Exploring issue & scanning repo tree', icon: '🔍' },
  { id: 2, label: 'Fetching identified source files', icon: '📂' },
  { id: 3, label: 'Generating implementation plan', icon: '⚙️' },
];

export function LoadingView({ loadingStep }: LoadingViewProps) {
  return (
    <div className="loading-view">
      <div className="loading-header">
        <div className="loading-orb">
          <div className="loading-orb-inner"></div>
          <div className="loading-ring ring-1"></div>
          <div className="loading-ring ring-2"></div>
          <div className="loading-ring ring-3"></div>
        </div>
        <p className="loading-title">Analyzing your issue<span className="loading-dots"><span>.</span><span>.</span><span>.</span></span></p>
      </div>

      <div className="loading-steps">
        {STEPS.map((step) => {
          const state = loadingStep > step.id ? 'completed' : loadingStep === step.id ? 'active' : 'pending';
          return (
            <div key={step.id} className={`loading-step-card ${state}`}>
              <div className="step-icon">{step.icon}</div>
              <div className="step-content">
                <span className="step-label">{step.label}</span>
                {state === 'active' && <div className="step-progress-bar"><div className="step-progress-fill"></div></div>}
                {state === 'completed' && <span className="step-status">✓ Complete</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="skeleton-preview">
        <div className="skeleton-line wide"></div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-line narrow"></div>
        <div className="skeleton-line wide"></div>
        <div className="skeleton-line medium"></div>
      </div>
    </div>
  );
}
