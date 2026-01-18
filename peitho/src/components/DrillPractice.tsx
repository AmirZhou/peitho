import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Recorder } from "./Recorder";
import type { Id } from "../../convex/_generated/dataModel";

interface UploadResult {
  storageId: Id<"_storage">;
}

interface DrillPracticeProps {
  drillId: string;
  onClose: () => void;
}

type DrillStep = "setup" | "recording" | "complete";

export function DrillPractice({ drillId, onClose }: DrillPracticeProps) {
  const drill = useQuery(api.drills.get, { id: drillId as any });
  const [step, setStep] = useState<DrillStep>("setup");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [recording, setRecording] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generateUploadUrl = useMutation(api.sessions.generateUploadUrl);

  // Memoize recording URL
  const recordingUrl = useMemo(() => {
    return recording ? URL.createObjectURL(recording) : null;
  }, [recording]);

  // Timer effect - only runs when isTimerRunning is true
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (isTimerRunning && timeLeft === 0) {
      // Timer finished - don't auto-complete, let user stop manually
    }
  }, [isTimerRunning, timeLeft]);

  const handleRecordingStart = () => {
    setStep("recording");
    setTimeLeft(drill?.durationSeconds ?? 60);
    setIsTimerRunning(true);
  };

  const handleRecordingComplete = (blob: Blob) => {
    setRecording(blob);
    setIsTimerRunning(false);
    setStep("complete");
  };

  const handleTryAgain = () => {
    setRecording(null);
    setStep("setup");
    setTimeLeft(0);
    setIsTimerRunning(false);
  };

  const handleSave = async () => {
    if (!recording) return;

    setSaving(true);
    try {
      // Upload recording to Convex storage
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": recording.type },
        body: recording,
      });

      if (!response.ok) {
        throw new Error("Failed to upload recording");
      }

      // For now, just close - drill recordings aren't stored in sessions
      // Could add a drillSessions table later if needed
      onClose();
    } catch (err) {
      console.error("Failed to save drill recording:", err);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!drill) {
    return (
      <div className="session-modal">
        <div className="session-container">
          <button onClick={onClose} className="close-btn">&times;</button>
          <p>Loading drill...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="session-modal">
      <div className="session-container">
        <button onClick={onClose} className="close-btn">&times;</button>

        {/* Setup Step - Show instructions and camera */}
        {step === "setup" && (
          <div className="drill-setup-step">
            <h2>{drill.name}</h2>
            <span className={`badge badge-${drill.type}`}>
              {drill.type.replace("_", " ")}
            </span>

            <div className="drill-meta">
              <span className="drill-duration">{formatTime(drill.durationSeconds)}</span>
            </div>

            <div className="drill-instructions-full">
              <pre>{drill.instructions}</pre>
            </div>

            <p className="drill-start-hint">Enable camera, then click Start Recording when ready</p>

            <Recorder
              onRecordingStart={handleRecordingStart}
              onRecordingComplete={handleRecordingComplete}
              autoRequestPermission
            />
          </div>
        )}

        {/* Recording Step */}
        {step === "recording" && (
          <div className="drill-practice-step">
            <div className="drill-timer">
              <span className={`time-display ${timeLeft <= 10 && timeLeft > 0 ? "warning" : ""}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="drill-prompt-reminder">
              <h3>{drill.name}</h3>
              <p>{drill.instructions.split("\n")[0]}</p>
            </div>

            <Recorder
              onRecordingStart={handleRecordingStart}
              onRecordingComplete={handleRecordingComplete}
            />
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <div className="drill-complete-step">
            <div className="complete-icon">✓</div>
            <h2>Drill Complete!</h2>

            {recordingUrl && (
              <div className="drill-recording-preview">
                <h4>Your Take</h4>
                <video
                  src={recordingUrl}
                  controls
                  playsInline
                  className="recording-preview"
                />
              </div>
            )}

            <div className="drill-actions">
              <button onClick={handleTryAgain} className="btn btn-secondary">
                Try Again
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? "Saving..." : "Save & Done"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
