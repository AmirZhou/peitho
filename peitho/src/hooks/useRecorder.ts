import { useState, useRef, useCallback, useEffect } from "react";

export type RecordingState = "idle" | "requesting" | "ready" | "recording" | "paused" | "stopped";

interface UseRecorderOptions {
  video?: boolean;
  audio?: boolean;
  facingMode?: "user" | "environment";
}

interface UseRecorderReturn {
  state: RecordingState;
  error: string | null;
  duration: number;
  previewRef: React.RefObject<HTMLVideoElement | null>;
  recordedBlob: Blob | null;
  recordedUrl: string | null;

  requestPermission: () => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
}

export function useRecorder(options: UseRecorderOptions = {}): UseRecorderReturn {
  const { video = true, audio = true, facingMode = "user" } = options;

  const [state, setState] = useState<RecordingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  const previewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  const requestPermission = useCallback(async () => {
    setState("requesting");
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        audio,
        video: video
          ? {
              facingMode,
              width: { ideal: 1080 },
              height: { ideal: 1920 },
            }
          : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.muted = true;
        await previewRef.current.play();
      }

      setState("ready");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to access camera/microphone";
      setError(message);
      setState("idle");
    }
  }, [audio, video, facingMode]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) {
      setError("No media stream available");
      return;
    }

    chunksRef.current = [];
    setRecordedBlob(null);

    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 2500000,
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    mediaRecorder.start(1000); // Collect data every second
    mediaRecorderRef.current = mediaRecorder;
    startTimeRef.current = Date.now();
    setDuration(0);

    // Start duration timer
    timerRef.current = window.setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    setState("recording");
  }, [recordedUrl]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setState("stopped");
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState("paused");
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      const pausedDuration = duration;
      startTimeRef.current = Date.now() - pausedDuration * 1000;

      timerRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      setState("recording");
    }
  }, [duration]);

  const resetRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    chunksRef.current = [];
    setRecordedBlob(null);
    setRecordedUrl(null);
    setDuration(0);
    setState(streamRef.current ? "ready" : "idle");
  }, [recordedUrl]);

  return {
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
  };
}

// Format duration as MM:SS
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
