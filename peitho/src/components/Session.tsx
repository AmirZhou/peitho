import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PromptGenerator } from "./PromptGenerator";
import { Recorder } from "./Recorder";
import type { Id } from "../../convex/_generated/dataModel";

type SessionStep = "prompt" | "record" | "review" | "complete";

interface GeneratedPrompt {
  topic: string;
  domain: string;
  frameworks: string[];
  frameworkIds: string[];
  hookSuggestion: string;
}

interface SessionProps {
  onClose: () => void;
}

export function Session({ onClose }: SessionProps) {
  const [step, setStep] = useState<SessionStep>("prompt");
  const [prompt, setPrompt] = useState<GeneratedPrompt | null>(null);
  const [recordings, setRecordings] = useState<Blob[]>([]);
  const [winNote, setWinNote] = useState("");
  const [improveNote, setImproveNote] = useState("");
  const [saving, setSaving] = useState(false);

  const createSession = useMutation(api.sessions.create);

  const handlePromptGenerated = (generatedPrompt: GeneratedPrompt) => {
    setPrompt(generatedPrompt);
  };

  const handleStartRecording = () => {
    setStep("record");
  };

  const handleRecordingComplete = (blob: Blob) => {
    setRecordings((prev) => [...prev, blob]);
    setStep("review");
  };

  const handleRecordAnother = () => {
    setStep("record");
  };

  const handleSaveSession = async () => {
    if (!prompt) return;

    setSaving(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      await createSession({
        date: today,
        domain: prompt.domain as "coding" | "running",
        promptUsed: prompt.topic,
        frameworksUsed: prompt.frameworkIds as Id<"frameworks">[],
        recordingIds: [], // TODO: Upload recordings to storage
        winNote,
        improveNote,
        durationMinutes: 0, // TODO: Calculate actual duration
      });

      setStep("complete");
    } catch (err) {
      console.error("Failed to save session:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="session-modal">
      <div className="session-container">
        {/* Header */}
        <div className="session-header">
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
          <div className="session-steps">
            <span className={`step ${step === "prompt" ? "active" : ""} ${["record", "review", "complete"].includes(step) ? "done" : ""}`}>
              1. Prompt
            </span>
            <span className={`step ${step === "record" ? "active" : ""} ${["review", "complete"].includes(step) ? "done" : ""}`}>
              2. Record
            </span>
            <span className={`step ${step === "review" ? "active" : ""} ${step === "complete" ? "done" : ""}`}>
              3. Review
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="session-content">
          {step === "prompt" && (
            <div className="step-prompt">
              <h2>Generate Your Prompt</h2>
              <PromptGenerator onPromptGenerated={handlePromptGenerated} />

              {prompt && (
                <button
                  onClick={handleStartRecording}
                  className="btn btn-primary btn-large"
                  style={{ marginTop: "24px" }}
                >
                  Start Recording
                </button>
              )}
            </div>
          )}

          {step === "record" && (
            <div className="step-record">
              {prompt && (
                <div className="prompt-reminder">
                  <p className="prompt-topic-small">{prompt.topic}</p>
                  <div className="prompt-frameworks-small">
                    {prompt.frameworks.map((f) => (
                      <span key={f} className="badge badge-small">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Recorder onRecordingComplete={handleRecordingComplete} />
            </div>
          )}

          {step === "review" && (
            <div className="step-review">
              <h2>Review & Save</h2>

              <div className="recordings-list">
                <h3>Your Takes ({recordings.length})</h3>
                {recordings.map((blob, index) => (
                  <div key={index} className="recording-item">
                    <video
                      src={URL.createObjectURL(blob)}
                      controls
                      playsInline
                      className="recording-preview"
                    />
                  </div>
                ))}
              </div>

              <button onClick={handleRecordAnother} className="btn btn-secondary">
                Record Another Take
              </button>

              <div className="session-notes">
                <div className="note-field">
                  <label htmlFor="winNote">What worked well?</label>
                  <textarea
                    id="winNote"
                    value={winNote}
                    onChange={(e) => setWinNote(e.target.value)}
                    placeholder="One thing that went well..."
                    rows={2}
                  />
                </div>

                <div className="note-field">
                  <label htmlFor="improveNote">What to improve?</label>
                  <textarea
                    id="improveNote"
                    value={improveNote}
                    onChange={(e) => setImproveNote(e.target.value)}
                    placeholder="One thing to work on..."
                    rows={2}
                  />
                </div>
              </div>

              <button
                onClick={handleSaveSession}
                disabled={saving}
                className="btn btn-primary btn-large"
              >
                {saving ? "Saving..." : "Save Session"}
              </button>
            </div>
          )}

          {step === "complete" && (
            <div className="step-complete">
              <div className="complete-icon">✓</div>
              <h2>Session Complete!</h2>
              <p>Great work. Keep the momentum going.</p>
              <button onClick={onClose} className="btn btn-primary btn-large">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
