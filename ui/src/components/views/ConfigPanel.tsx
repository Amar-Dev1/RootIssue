import { useState, useEffect } from "react";
import type { UserSettings } from "../../utils/storage";
import { Eye, EyeClosed } from "lucide-react";

interface ConfigPanelProps {
  settings: UserSettings;
  onSaveSettings: (settings: Partial<UserSettings>) => void;
  onGeneratePlan: (issueUrl: string) => void;
  isLoading: boolean;
}

const PROVIDERS = ["google", "openai", "anthropic"];

export function ConfigPanel({
  settings,
  onSaveSettings,
  onGeneratePlan,
  isLoading,
}: ConfigPanelProps) {
  const [provider, setProvider] = useState<string>(settings.provider || "");
  const [model, setModel] = useState<string>(settings.model || "");
  const [apiKey, setApiKey] = useState<string>(settings.apiKey || "");
  const [githubToken, setGithubToken] = useState<string>(
    settings.githubToken || "",
  );
  const [issueUrl, setIssueUrl] = useState<string>(
    settings.currentIssueUrl || "",
  );

  const [isEditingToken, setIsEditingToken] = useState(!settings.githubToken);
  const [availableModels, setAvailableModels] = useState<string[]>(
    model ? [model] : [],
  );
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [fetchedProviders, setFetchedProviders] = useState<Set<string>>(
    new Set(),
  );
  const [useCredits, setUseCredits] = useState<boolean>(!settings.apiKey);
  const [tokenVisible, setTokenVisible] = useState<boolean>(false);

  useEffect(() => {
    // Sync external setting changes
    if (settings.provider) setProvider(settings.provider);
    if (settings.model) setModel(settings.model);
    if (settings.apiKey) setApiKey(settings.apiKey);
    if (settings.githubToken) {
      setGithubToken(settings.githubToken);
      setIsEditingToken(false);
    }
    if (settings.currentIssueUrl) setIssueUrl(settings.currentIssueUrl);
  }, [settings]);

  const handleModelDropdownFocus = async () => {
    if (fetchedProviders.has(provider) || isFetchingModels) return;
    try {
      setIsFetchingModels(true);
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/fetch-models/${provider}`,
      );
      const data = await res.json();
      if (data && data.result && Array.isArray(data.result)) {
        setAvailableModels(data.result);
        if (!data.result.includes(model)) {
          setModel(data.result[0]);
          onSaveSettings({ model: data.result[0] });
        }
      }
      setFetchedProviders(new Set(fetchedProviders).add(provider));
    } catch (err) {
      console.error("Failed to fetch models for provider:", provider, err);
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    setModel("");
    setAvailableModels([]);
    setFetchedProviders(new Set()); // reset cache so models are re-fetched for the new provider
    onSaveSettings({ provider: newProvider, model: "" });
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    onSaveSettings({ model: newModel });
  };

  const handleBlurSettings = () => {
    onSaveSettings({ apiKey, githubToken });
  };

  const handleIssueUrlChange = (val: string) => {
    setIssueUrl(val);
    onSaveSettings({ currentIssueUrl: val });
  };

  const handleGenerate = () => {
    if (!issueUrl.trim()) {
      alert("Please enter a valid GitHub issue URL.");
      return;
    }
    if (!useCredits && !apiKey.trim()) {
      alert("Please enter your LLM API key, or switch to free credits mode.");
      return;
    }
    if (!apiKey && !settings.credits) {
      alert("You have run out of free tries. Please provide an LLM API key.");
      return;
    }
    handleBlurSettings();
    onGeneratePlan(issueUrl.trim());
  };


  return (
    <div className="config-panel">
      <div className="config-header">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5z"
            stroke="var(--accent-color)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M2 17l10 5 10-5"
            stroke="var(--accent-color)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M2 12l10 5 10-5"
            stroke="var(--accent-color)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        <h2>RootIssue Planner</h2>
        <p>
          Configure models and generate implementation plans directly from
          GitHub issues.
        </p>
      </div>

      <div className="input-group">
        <label htmlFor="github-token">1. GitHub Access Token</label>
        {!isEditingToken && githubToken ? (
          <div className="token-status">
            <span className="badge success">Token Provided ✓</span>
            <button
              className="btn-text"
              onClick={() => setIsEditingToken(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <div style={{ position: "relative" }} className="input-group">
            <input
              type={tokenVisible ? "text" : "password"}
              id="github-token"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              autoComplete="off"
              spellCheck="false"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
            />
            <span
              style={{ position: "absolute", right: 7, top: 10 }}
              onClick={() => setTokenVisible((prev)=>!prev)}
            >
              {tokenVisible ? <EyeClosed size={"18"} /> : <Eye size={"18"} />}
            </span>

            <button
              className="btn-generate"
              onClick={() => {
                handleBlurSettings();
                if (githubToken.trim()) setIsEditingToken(false);
              }}
            >
              Save
            </button>
          </div>
        )}
      </div>

      {githubToken && !isEditingToken && (
        <div className="fade-in-section">
          <div className="llm-settings-group">
            <div
              className="group-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              2. LLM Settings
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: "normal",
                  cursor: "pointer",
                  textTransform: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={useCredits}
                  onChange={(e) => {
                    setUseCredits(e.target.checked);
                    if (e.target.checked) {
                      setApiKey("");
                      setProvider("google");
                      setModel("gemini-2.5-flash-lite");
                      onSaveSettings({
                        apiKey: "",
                        provider: "google",
                        model: "gemini-2.5-flash-lite",
                      });
                    }
                  }}
                />
                Use free credits mode
              </label>
            </div>

            <div
              className={`input-row ${useCredits ? "disabled-section" : ""}`}
              style={useCredits ? { opacity: 0.5, pointerEvents: "none" } : {}}
            >
              <div className="input-group">
                <label>Provider</label>
                <select
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  disabled={useCredits}
                >
                  <option value="" disabled>
                    Select Provider...
                  </option>
                  {PROVIDERS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Model</label>
                <select
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  onFocus={handleModelDropdownFocus}
                  disabled={useCredits || isFetchingModels}
                >
                  {isFetchingModels ? (
                    <option>Loading...</option>
                  ) : availableModels.length === 0 ? (
                    <option value="" disabled>
                      Select Model...
                    </option>
                  ) : (
                    availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div
              className="input-group"
              style={useCredits ? { opacity: 0.5, pointerEvents: "none" } : {}}
            >
              <label htmlFor="api-key">LLM API Key</label>
              <input
                required
                type="password"
                id="api-key"
                placeholder={`Enter your ${provider} API Key`}
                autoComplete="off"
                spellCheck="false"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onBlur={handleBlurSettings}
                disabled={useCredits}
              />
            </div>
          </div>

          <div className="divider"></div>

          <div className="input-group issue-url-group">
            <label htmlFor="issue-url">3. GitHub Issue URL</label>
            <input
              type="text"
              id="issue-url"
              placeholder="https://github.com/owner/repo/issues/123"
              autoComplete="off"
              spellCheck="false"
              value={issueUrl}
              onChange={(e) => handleIssueUrlChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGenerate();
              }}
            />
          </div>

          <button
            className="btn-generate"
            disabled={isLoading}
            onClick={handleGenerate}
          >
            <span className="btn-generate-text">
              {isLoading ? "Generating..." : "Generate Plan"}
            </span>
          </button>

          {!apiKey && settings.credits !== undefined && (
            <div className="credits-info">
              Free tries remaining: {settings.credits} / 3
            </div>
          )}
        </div>
      )}
    </div>
  );
}
