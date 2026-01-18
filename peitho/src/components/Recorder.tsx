import { useRecorder, formatDuration } from "../hooks/useRecorder";

interface RecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
}

export function Recorder({ onRecordingComplete }: RecorderProps) {
  const {
    state,
    error,
    duration,
    previewRef,
    recordedBlob,
    recordedUrl,
    requestPermission,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useRecorder({ video: true, audio: true });

  const handleSave = () => {
    if (recordedBlob) {
      onRecordingComplete?.(recordedBlob);
    }
  };

  return (
    <div className="recorder">
      {/* Video Preview / Playback */}
      <div className="video-container">
        {state === "stopped" && recordedUrl ? (
          <video
            src={recordedUrl}
            controls
            playsInline
            className="video-player"
          />
        ) : (
          <video
            ref={previewRef}
            autoPlay
            playsInline
            muted
            className="video-preview"
          />
        )}

        {/* Recording Indicator */}
        {state === "recording" && (
          <div className="recording-indicator">
            <span className="recording-dot" />
            <span className="recording-time">{formatDuration(duration)}</span>
          </div>
        )}

        {/* Paused Indicator */}
        {state === "paused" && (
          <div className="paused-indicator">
            <span>PAUSED</span>
            <span className="recording-time">{formatDuration(duration)}</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && <p className="error-message">{error}</p>}

      {/* Controls */}
      <div className="recorder-controls">
        {state === "idle" && (
          <button onClick={requestPermission} className="btn btn-primary btn-large">
            Enable Camera
          </button>
        )}

        {state === "requesting" && (
          <button disabled className="btn btn-large">
            Requesting access...
          </button>
        )}

        {state === "ready" && (
          <button onClick={startRecording} className="btn btn-record btn-large">
            <span className="record-icon" />
            Start Recording
          </button>
        )}

        {state === "recording" && (
          <div className="recording-buttons">
            <button onClick={pauseRecording} className="btn btn-secondary">
              Pause
            </button>
            <button onClick={stopRecording} className="btn btn-stop">
              Stop
            </button>
          </div>
        )}

        {state === "paused" && (
          <div className="recording-buttons">
            <button onClick={resumeRecording} className="btn btn-primary">
              Resume
            </button>
            <button onClick={stopRecording} className="btn btn-stop">
              Stop
            </button>
          </div>
        )}

        {state === "stopped" && (
          <div className="post-recording-buttons">
            <button onClick={resetRecording} className="btn btn-secondary">
              Redo
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              Save Take
            </button>
          </div>
        )}
      </div>

      {/* Duration Display for stopped state */}
      {state === "stopped" && (
        <p className="final-duration">Duration: {formatDuration(duration)}</p>
      )}
    </div>
  );
}
