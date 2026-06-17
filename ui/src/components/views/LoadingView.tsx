

interface LoadingViewProps {
  loadingStep: number;
}

export function LoadingView({ loadingStep }: LoadingViewProps) {
  return (
    <div id="state-loading" className="state-panel active">
      <div className="loading-container">
        <div className="loading-orb">
          <div className="loading-orb-inner"></div>
          <div className="loading-ring ring-1"></div>
          <div className="loading-ring ring-2"></div>
          <div className="loading-ring ring-3"></div>
        </div>
        <div className="loading-steps">
          <div className={`loading-step ${loadingStep >= 1 ? (loadingStep > 1 ? 'completed' : 'active') : ''}`} id="step-1">
            <div className="step-dot"></div>
            <span>Scanning repository tree</span>
          </div>
          <div className={`loading-step ${loadingStep >= 2 ? (loadingStep > 2 ? 'completed' : 'active') : ''}`} id="step-2">
            <div className="step-dot"></div>
            <span>ExplorerLLM identifying files</span>
          </div>
          <div className={`loading-step ${loadingStep >= 3 ? (loadingStep > 3 ? 'completed' : 'active') : ''}`} id="step-3">
            <div className="step-dot"></div>
            <span>PlannerLLM generating plan</span>
          </div>
        </div>
        <p className="loading-label">Analyzing your issue<span className="loading-dots"><span>.</span><span>.</span><span>.</span></span></p>
      </div>
    </div>
  );
}
