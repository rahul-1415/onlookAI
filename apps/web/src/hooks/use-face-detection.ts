"use client";

import { useRef, useCallback, useState, useEffect } from "react";

export type FaceStatus = "unknown" | "detected" | "not_detected" | "unavailable";

interface UseFaceDetectionOptions {
  /** Milliseconds between detection runs. Default 1500 (1.5s). */
  intervalMs?: number;
  /** Consecutive "no face" frames before firing event. Default 3. */
  noFaceThreshold?: number;
}

export function useFaceDetection(options: UseFaceDetectionOptions = {}) {
  const { intervalMs = 1500, noFaceThreshold = 3 } = options;

  const [faceStatus, setFaceStatus] = useState<FaceStatus>("unknown");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<unknown>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const noFaceCountRef = useRef(0);
  const lastStatusRef = useRef<FaceStatus>("unknown");

  // Initialize MediaPipe FaceDetector (dynamic import to avoid SSR issues)
  const initDetector = useCallback(async () => {
    const { FaceDetector, FilesetResolver } = await import(
      "@mediapipe/tasks-vision"
    );
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    detectorRef.current = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
        delegate: "GPU",
      },
      runningMode: "IMAGE",
      minDetectionConfidence: 0.5,
    });
  }, []);

  // Start camera + detection loop
  const startDetection = useCallback(async () => {
    try {
      // Request camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
      });
      streamRef.current = stream;

      // Create a hidden video element for the camera feed
      const video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();
      videoRef.current = video;

      // Initialize detector if not yet done
      if (!detectorRef.current) {
        await initDetector();
      }

      // Start detection interval
      intervalRef.current = setInterval(() => {
        const detector = detectorRef.current as {
          detect: (video: HTMLVideoElement) => { detections: unknown[] };
        } | null;
        if (!detector || !videoRef.current) return;
        if (videoRef.current.readyState < 2) return;

        const result = detector.detect(videoRef.current);
        const hasFace = result.detections.length > 0;

        if (hasFace) {
          noFaceCountRef.current = 0;
          if (lastStatusRef.current !== "detected") {
            lastStatusRef.current = "detected";
            setFaceStatus("detected");
          }
        } else {
          noFaceCountRef.current += 1;
          if (
            noFaceCountRef.current >= noFaceThreshold &&
            lastStatusRef.current !== "not_detected"
          ) {
            lastStatusRef.current = "not_detected";
            setFaceStatus("not_detected");
          }
        }
      }, intervalMs);

      setCameraError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Camera access denied";
      setCameraError(msg);
      setFaceStatus("unavailable");
    }
  }, [initDetector, intervalMs, noFaceThreshold]);

  // Stop camera + detection
  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }
    noFaceCountRef.current = 0;
    lastStatusRef.current = "unknown";
    setFaceStatus("unknown");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopDetection();
  }, [stopDetection]);

  return {
    faceStatus,
    cameraError,
    startDetection,
    stopDetection,
  };
}
