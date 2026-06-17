import { useState } from 'react';
import { MarkdownViewer } from '../MarkdownViewer';

interface ResultViewProps {
  generatedPlan: string;
  onRegenerate: () => void;
}

export function ResultView({ generatedPlan, onRegenerate }: ResultViewProps) {
  const [copied, setCopied] = useState(false);

  const copyPlanToClipboard = () => {
    navigator.clipboard.writeText(generatedPlan).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div id="state-result" className="state-panel active">
      <div className="result-toolbar">
        <div className="result-toolbar-left">
          <span className="result-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Plan ready
          </span>
        </div>
        <div className="result-toolbar-right">
          <button 
            className="toolbar-btn" 
            id="btn-copy" 
            title="Copy markdown" 
            aria-label="Copy plan to clipboard"
            onClick={copyPlanToClipboard}
            style={{
              borderColor: copied ? 'var(--success-color)' : '',
              color: copied ? 'var(--success-color)' : ''
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span id="copy-label">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button className="toolbar-btn" id="btn-regenerate" title="Regenerate plan" aria-label="Regenerate plan" onClick={onRegenerate}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Regenerate
          </button>
        </div>
      </div>
      <MarkdownViewer markdown={generatedPlan} />
    </div>
  );
}
