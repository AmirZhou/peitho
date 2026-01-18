import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { generateScript } from "../lib/openai";

interface ScriptHelperProps {
  topic: string;
  frameworks: string[];
  frameworkIds: string[];
  onClose: () => void;
}

export function ScriptHelper({ topic, frameworks, frameworkIds, onClose }: ScriptHelperProps) {
  const [customTopic, setCustomTopic] = useState(topic);
  const [script, setScript] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = useQuery(api.settings.getApiKey);
  const allFrameworks = useQuery(api.frameworks.list);

  // Get the full framework objects for the selected frameworks
  const selectedFrameworks = allFrameworks?.filter((f) =>
    frameworkIds.includes(f._id)
  ) || [];

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Please set your OpenAI API key first");
      return;
    }

    if (!customTopic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateScript({
        apiKey,
        topic: customTopic,
        frameworks: selectedFrameworks,
      });
      setScript(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate script");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content script-helper" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="close-btn">&times;</button>

        <h2>Script Helper</h2>
        <p className="helper-subtitle">Generate a script using your frameworks</p>

        <div className="script-frameworks">
          <h4>Using Frameworks:</h4>
          <div className="framework-badges">
            {frameworks.map((f) => (
              <span key={f} className="badge badge-universal">{f}</span>
            ))}
          </div>
        </div>

        {selectedFrameworks.length > 0 && (
          <div className="framework-patterns">
            <h4>Framework Patterns:</h4>
            {selectedFrameworks.map((f) => (
              <div key={f._id} className="pattern-preview">
                <strong>{f.name}:</strong>
                <pre>{f.pattern}</pre>
              </div>
            ))}
          </div>
        )}

        <div className="topic-input">
          <label htmlFor="scriptTopic">Your Topic / Angle:</label>
          <textarea
            id="scriptTopic"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="What specific point do you want to make?"
            rows={2}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !customTopic.trim()}
          className="btn btn-primary btn-large"
        >
          {loading ? "Generating..." : "Generate Script"}
        </button>

        {error && <p className="error-message">{error}</p>}

        {script && (
          <div className="generated-script">
            <h3>Your Script</h3>
            <div className="script-content">
              <pre>{script}</pre>
            </div>
            <p className="script-note">
              Use this as a starting point. Make it your own!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
