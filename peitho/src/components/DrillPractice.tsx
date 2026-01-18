import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Recorder } from "./Recorder";

interface DrillPracticeProps {
  drillId: string;
  onClose: () => void;
}

type DrillStep = "instructions" | "countdown" | "practice" | "complete";

export function DrillPractice({ drillId, onClose }: DrillPracticeProps) {
  const drill = useQuery(api.drills.get, { id: drillId as any });
  const [step, setStep] = useState<DrillStep>("instructions");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [recording, setRecording] = useState<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Countdown effect
  useEffect(() => {
    if (step === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === "countdown" && countdown === 0) {
      setStep("practice");
      setTimeLeft(drill?.durationSeconds ?? 60);
    }
  }, [step, countdown, drill?.durationSeconds]);

  // Practice timer effect
  useEffect(() => {
    if (step === "practice" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else if (step === "practice" && timeLeft === 0) {
      setStep("complete");
    }
  }, [step, timeLeft]);

  const handleStart = () => {
    setCountdown(3);
    setStep("countdown");
  };

  const handleRecordingComplete = (blob: Blob) => {
    setRecording(blob);
  };

  const handleTryAgain = () => {
    setRecording(null);
    setStep("instructions");
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

        {/* Instructions Step */}
        {step === "instructions" && (
          <div className="drill-instructions-step">
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

            <button onClick={handleStart} className="btn btn-primary btn-large">
              Start Drill
            </button>
          </div>
        )}

        {/* Countdown Step */}
        {step === "countdown" && (
          <div className="drill-countdown">
            <h2>Get Ready</h2>
            <div className="countdown-number">{countdown}</div>
            <p>{drill.name}</p>
          </div>
        )}

        {/* Practice Step */}
        {step === "practice" && (
          <div className="drill-practice-step">
            <div className="drill-timer">
              <span className={`time-display ${timeLeft <= 10 ? "warning" : ""}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="drill-prompt-reminder">
              <h3>{drill.name}</h3>
              <p>{drill.instructions.split("\n")[0]}</p>
            </div>

            <Recorder onRecordingComplete={handleRecordingComplete} />

            <button
              onClick={() => setStep("complete")}
              className="btn btn-secondary"
            >
              Finish Early
            </button>
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <div className="drill-complete-step">
            <div className="complete-icon">✓</div>
            <h2>Drill Complete!</h2>

            {recording && (
              <div className="drill-recording-preview">
                <h4>Your Take</h4>
                <video
                  src={URL.createObjectURL(recording)}
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
              <button onClick={onClose} className="btn btn-primary">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
