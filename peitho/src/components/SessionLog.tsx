import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { transcribeAudio, evaluateTranscript, EvaluationResult } from "../lib/openai";

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
  const formattedDate = new Date(session.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className={`session-log-card ${expanded ? "expanded" : ""}`}>
      <div className="session-log-header" onClick={onToggle}>
        <div className="session-log-info">
          <span className="session-date">{formattedDate}</span>
          <span className={`badge badge-${session.domain}`}>{session.domain}</span>
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
