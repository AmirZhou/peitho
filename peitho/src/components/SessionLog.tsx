import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { transcribeAudio, evaluateTranscript } from "../lib/openai";
import type { EvaluationResult } from "../lib/openai";

interface SessionData {
  _id: Id<"sessions">;
  date: string;
  domain: "coding" | "running";
  promptUsed: string;
  recordingIds: Id<"_storage">[];
  frameworksUsed: Id<"frameworks">[];
  winNote: string;
  improveNote: string;
  durationMinutes: number;
  transcript?: string;
  evaluation?: string;
}

export function SessionLog() {
  const sessions = useQuery(api.sessions.list);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  if (!sessions) {
    return (
      <section className="card">
        <h2>Session Log</h2>
        <p className="loading">Loading sessions...</p>
      </section>
    );
  }

  if (sessions.length === 0) {
    return (
      <section className="card">
        <h2>Session Log</h2>
        <p className="empty-state">No sessions yet. Start practicing!</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h2>Session Log</h2>
      <p className="section-hint">{sessions.length} session{sessions.length !== 1 ? "s" : ""} recorded</p>

      <div className="session-log-list">
        {sessions.map((session) => (
          <SessionCard
            key={session._id}
            session={session as SessionData}
            expanded={expandedSession === session._id}
            onToggle={() => setExpandedSession(
              expandedSession === session._id ? null : session._id
            )}
          />
        ))}
      </div>
    </section>
  );
}

interface SessionCardProps {
  session: SessionData;
  expanded: boolean;
  onToggle: () => void;
}

function SessionCard({ session, expanded, onToggle }: SessionCardProps) {
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const apiKey = useQuery(api.settings.getApiKey);
  const sessionWithFrameworks = useQuery(
    api.sessions.getWithFrameworks,
    expanded ? { id: session._id } : "skip"
  );
  const saveFeedback = useMutation(api.sessions.saveFeedback);

  const formattedDate = new Date(session.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const parsedEvaluation: EvaluationResult | null = session.evaluation
    ? JSON.parse(session.evaluation)
    : null;

  // Get recording URL for feedback
  const firstRecordingUrl = useQuery(
    api.sessions.getRecordingUrl,
    session.recordingIds.length > 0 ? { storageId: session.recordingIds[0] } : "skip"
  );

  const handleGetFeedback = async () => {
    if (!apiKey || !firstRecordingUrl) return;

    setFeedbackLoading(true);
    setFeedbackError(null);

    try {
      // Fetch the recording blob from the URL
      const response = await fetch(firstRecordingUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch recording");
      }

      const audioBlob = await response.blob();

      // Step 1: Transcribe
      const transcription = await transcribeAudio(apiKey, audioBlob);

      // Step 2: Evaluate
      const frameworks = sessionWithFrameworks?.frameworks || [];
      const evaluation = await evaluateTranscript(
        apiKey,
        transcription.text,
        session.promptUsed,
        frameworks.map((f) => ({ name: f?.name || "", pattern: f?.pattern || "" }))
      );

      // Step 3: Save to database
      await saveFeedback({
        id: session._id,
        transcript: transcription.text,
        evaluation: JSON.stringify(evaluation),
      });
    } catch (err) {
      console.error("Failed to get feedback:", err);
      setFeedbackError(err instanceof Error ? err.message : "Failed to get feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className={`session-log-card ${expanded ? "expanded" : ""}`}>
      <div className="session-log-header" onClick={onToggle}>
        <div className="session-log-info">
          <span className="session-date">{formattedDate}</span>
          <span className={`badge badge-${session.domain}`}>{session.domain}</span>
          {parsedEvaluation && (
            <span className="feedback-score">Score: {parsedEvaluation.overallScore}/10</span>
          )}
        </div>
        <span className="session-expand-icon">{expanded ? "−" : "+"}</span>
      </div>

      <p className="session-prompt">{session.promptUsed}</p>

      {expanded && (
        <div className="session-log-details">
          {session.recordingIds.length > 0 && (
            <div className="session-recordings">
              <h4>Recordings ({session.recordingIds.length})</h4>
              {session.recordingIds.map((storageId, index) => (
                <RecordingPlayer key={storageId} storageId={storageId} index={index} />
              ))}
            </div>
          )}

          {/* Feedback Section */}
          <div className="session-feedback-section">
            {!parsedEvaluation && session.recordingIds.length > 0 && (
              <button
                onClick={handleGetFeedback}
                disabled={feedbackLoading || !apiKey}
                className="btn btn-primary"
              >
                {feedbackLoading ? "Analyzing..." : "Get AI Feedback"}
              </button>
            )}

            {feedbackError && <p className="error-message">{feedbackError}</p>}

            {!apiKey && session.recordingIds.length > 0 && !parsedEvaluation && (
              <p className="feedback-note">Add your OpenAI API key in Settings to get AI feedback</p>
            )}

            {parsedEvaluation && (
              <FeedbackDisplay
                evaluation={parsedEvaluation}
                transcript={session.transcript || ""}
              />
            )}
          </div>

          {(session.winNote || session.improveNote) && (
            <div className="session-notes-review">
              {session.winNote && (
                <div className="note-item">
                  <span className="note-label">What worked:</span>
                  <p>{session.winNote}</p>
                </div>
              )}
              {session.improveNote && (
                <div className="note-item">
                  <span className="note-label">To improve:</span>
                  <p>{session.improveNote}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Component to display the evaluation results
function FeedbackDisplay({
  evaluation,
  transcript,
}: {
  evaluation: EvaluationResult;
  transcript: string;
}) {
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <div className="feedback-display">
      <div className="feedback-header">
        <div className="feedback-score-large">
          <span className="score-number">{evaluation.overallScore}</span>
          <span className="score-label">/10</span>
        </div>
        <p className="feedback-summary">{evaluation.summary}</p>
      </div>

      {/* Strengths */}
      {evaluation.strengths.length > 0 && (
        <div className="feedback-section">
          <h4>Strengths</h4>
          <ul className="feedback-list strengths">
            {evaluation.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {evaluation.improvements.length > 0 && (
        <div className="feedback-section">
          <h4>Areas to Improve</h4>
          <ul className="feedback-list improvements">
            {evaluation.improvements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Framework Adherence */}
      {evaluation.frameworkAdherence.length > 0 && (
        <div className="feedback-section">
          <h4>Framework Adherence</h4>
          {evaluation.frameworkAdherence.map((fa, i) => (
            <div key={i} className="framework-score">
              <div className="framework-score-header">
                <span className="framework-name">{fa.framework}</span>
                <span className="framework-score-value">{fa.score}/10</span>
              </div>
              <p>{fa.feedback}</p>
            </div>
          ))}
        </div>
      )}

      {/* Sentence Feedback */}
      {evaluation.sentenceFeedback.length > 0 && (
        <div className="feedback-section">
          <h4>Sentence-by-Sentence Feedback</h4>
          {evaluation.sentenceFeedback.map((sf, i) => (
            <div key={i} className="sentence-feedback">
              <p className="original-sentence">"{sf.sentence}"</p>
              <p className="sentence-comment">{sf.feedback}</p>
              {sf.suggestion && (
                <p className="sentence-suggestion">
                  <strong>Try:</strong> "{sf.suggestion}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Transcript Toggle */}
      <button
        onClick={() => setShowTranscript(!showTranscript)}
        className="btn btn-link"
      >
        {showTranscript ? "Hide Transcript" : "Show Transcript"}
      </button>

      {showTranscript && (
        <div className="transcript-display">
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}

interface RecordingPlayerProps {
  storageId: Id<"_storage">;
  index: number;
}

function RecordingPlayer({ storageId, index }: RecordingPlayerProps) {
  const url = useQuery(api.sessions.getRecordingUrl, { storageId });

  if (!url) {
    return <div className="recording-loading">Loading recording {index + 1}...</div>;
  }

  return (
    <div className="recording-player">
      <video
        src={url}
        controls
        playsInline
        className="recording-video"
      />
    </div>
  );
}
