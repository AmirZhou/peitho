import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { generatePrompt } from "../lib/openai";
import type { Id } from "../../convex/_generated/dataModel";

interface GeneratedPrompt {
  topic: string;
  domain: string;
  frameworks: string[];
  frameworkIds: string[];
  hookSuggestion: string;
}

interface PromptGeneratorProps {
  onPromptGenerated?: (prompt: GeneratedPrompt) => void;
}

type Domain = "coding" | "running";
type Mode = "domain_lock" | "guided" | "framework_lock" | "freestyle";

export function PromptGenerator({ onPromptGenerated }: PromptGeneratorProps) {
  const [domain, setDomain] = useState<Domain>("coding");
  const [mode] = useState<Mode>("domain_lock");
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);

  const frameworks = useQuery(api.prompts.getFrameworksForPrompt, { domain });
  const recentPrompts = useQuery(api.prompts.recentByDomain, { domain, limit: 10 });
  const storedApiKey = useQuery(api.settings.getApiKey);
  const savePrompt = useMutation(api.prompts.save);
  const saveApiKeyMutation = useMutation(api.settings.saveApiKey);

  // Show API key input if no key is stored
  const hasApiKey = storedApiKey !== undefined && storedApiKey !== null;

  const handleSaveApiKey = async () => {
    if (apiKeyInput.trim()) {
      setSavingKey(true);
      try {
        await saveApiKeyMutation({ apiKey: apiKeyInput.trim() });
        setApiKeyInput("");
        setShowApiKeyInput(false);
      } catch (err) {
        setError("Failed to save API key");
      } finally {
        setSavingKey(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    if (!frameworks) {
      setError("Frameworks not loaded yet");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generatePrompt({
        apiKey,
        domain,
        frameworks,
        recentPrompts: recentPrompts?.map((p) => p.prompt) || [],
        mode,
      });

      setGeneratedPrompt(result);

      // Save to history
      await savePrompt({
        prompt: result.topic,
        domain: result.domain,
        frameworkIds: result.frameworkIds as Id<"frameworks">[],
      });

      onPromptGenerated?.(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate prompt";
      setError(message);

      // If auth error, show API key input
      if (message.includes("401") || message.includes("API key")) {
        setShowApiKeyInput(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prompt-generator">
      {/* API Key Input */}
      {showApiKeyInput && (
        <div className="api-key-section">
          <label htmlFor="apiKey">OpenAI API Key</label>
          <div className="api-key-input-row">
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <button onClick={handleSaveApiKey} className="btn btn-small">
              Save
            </button>
          </div>
          <p className="api-key-note">Stored locally in your browser</p>
        </div>
      )}

      {/* Domain Selector */}
      <div className="domain-selector">
        <button
          className={`domain-btn ${domain === "coding" ? "active" : ""}`}
          onClick={() => setDomain("coding")}
        >
          Coding
        </button>
        <button
          className={`domain-btn ${domain === "running" ? "active" : ""}`}
          onClick={() => setDomain("running")}
        >
          Running
        </button>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !frameworks}
        className="btn btn-primary btn-large"
      >
        {loading ? "Generating..." : generatedPrompt ? "Regenerate" : "Generate Prompt"}
      </button>

      {/* Error Display */}
      {error && <p className="error-message">{error}</p>}

      {/* Generated Prompt Display */}
      {generatedPrompt && (
        <div className="generated-prompt">
          <div className="prompt-topic">
            <h3>Topic</h3>
            <p>{generatedPrompt.topic}</p>
          </div>

          <div className="prompt-frameworks">
            <h3>Frameworks to Use</h3>
            <div className="framework-badges">
              {generatedPrompt.frameworks.map((f) => (
                <span key={f} className="badge badge-universal">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="prompt-hook">
            <h3>Hook Suggestion</h3>
            <p className="hook-text">"{generatedPrompt.hookSuggestion}"</p>
          </div>
        </div>
      )}

      {/* Settings Link */}
      {!showApiKeyInput && apiKey && (
        <button
          className="btn-link"
          onClick={() => setShowApiKeyInput(true)}
        >
          Change API Key
        </button>
      )}
    </div>
  );
}
