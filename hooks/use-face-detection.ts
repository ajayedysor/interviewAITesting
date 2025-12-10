"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface FaceMetrics {
  faceDetected: boolean;
  faceCount: number;
  eyeContact: "good" | "poor" | "lost";
  headPosition: "center" | "left" | "right" | "up" | "down";
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export interface FaceViolation {
  type: "no_face" | "multiple_faces" | "looking_away" | "head_turned";
  message: string;
  timestamp: Date;
}

interface UseFaceDetectionOptions {
  onViolation?: (violation: FaceViolation) => void;
  noFaceThreshold?: number; // seconds before triggering no face violation
  lookAwayThreshold?: number; // seconds before triggering look away violation
}

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  options: UseFaceDetectionOptions = {}
) {
  const {
    onViolation,
    noFaceThreshold = 2,
    lookAwayThreshold = 3,
  } = options;

  // Keep a stable reference to onViolation to avoid re-creating callbacks/effects
  const onViolationRef = useRef<typeof onViolation>(onViolation);
  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  const [metrics, setMetrics] = useState<FaceMetrics>({
    faceDetected: false,
    faceCount: 0,
    eyeContact: "lost",
    headPosition: "center",
    boundingBox: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const detectorRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const noFaceStartRef = useRef<number | null>(null);
  const lookAwayStartRef = useRef<number | null>(null);
  const lastViolationRef = useRef<string | null>(null);
  const lastViolationTimeRef = useRef<number>(0);

  // Initialize face detection
  const initializeDetector = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Dynamic import to avoid SSR issues
      const vision = await import("@mediapipe/tasks-vision");
      const { FaceDetector, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const detector = await FaceDetector.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        minDetectionConfidence: 0.5,
      });

      detectorRef.current = detector;
      setIsLoading(false);
      console.log("✅ Face detection initialized");
    } catch (err: any) {
      console.error("Face detection initialization error:", err);
      setError(err.message || "Failed to initialize face detection");
      setIsLoading(false);
    }
  }, []);

  // Detect faces in video frame
  const detectFaces = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2) return; // Video not ready

    try {
      const detections = detectorRef.current.detectForVideo(
        video,
        performance.now()
      );

      const faceCount = detections.detections.length;
      const faceDetected = faceCount > 0;
      const now = Date.now();

      let eyeContact: "good" | "poor" | "lost" = "lost";
      let headPosition: "center" | "left" | "right" | "up" | "down" = "center";
      let boundingBox = null;

      if (faceDetected && detections.detections[0]) {
        const detection = detections.detections[0];
        const bbox = detection.boundingBox;

        if (bbox) {
          boundingBox = {
            x: bbox.originX,
            y: bbox.originY,
            width: bbox.width,
            height: bbox.height,
          };

          // Calculate face position relative to video center
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;
          const faceCenterX = bbox.originX + bbox.width / 2;
          const faceCenterY = bbox.originY + bbox.height / 2;

          // Determine head position
          const horizontalOffset = (faceCenterX - videoWidth / 2) / videoWidth;
          const verticalOffset = (faceCenterY - videoHeight / 2) / videoHeight;

          if (Math.abs(horizontalOffset) < 0.15 && Math.abs(verticalOffset) < 0.15) {
            headPosition = "center";
            eyeContact = "good";
          } else if (horizontalOffset < -0.15) {
            headPosition = "left";
            eyeContact = "poor";
          } else if (horizontalOffset > 0.15) {
            headPosition = "right";
            eyeContact = "poor";
          } else if (verticalOffset < -0.15) {
            headPosition = "up";
            eyeContact = "poor";
          } else if (verticalOffset > 0.15) {
            headPosition = "down";
            eyeContact = "poor";
          }
        }
      }

      // Update metrics
      setMetrics({
        faceDetected,
        faceCount,
        eyeContact,
        headPosition,
        boundingBox,
      });

      // Handle violations via stable ref with global cooldown
      if (onViolationRef.current) {
        const violationCooldownMs = 40_000; // 1 minute cooldown between any violations

        const triggerViolation = (v: FaceViolation) => {
          const nowTs = Date.now();
          if (nowTs - lastViolationTimeRef.current < violationCooldownMs) {
            return; // skip if within cooldown window
          }
          lastViolationTimeRef.current = nowTs;
          onViolationRef.current?.(v);
        };

        // No face detected
        if (!faceDetected) {
          if (!noFaceStartRef.current) {
            noFaceStartRef.current = now;
          } else if (
            now - noFaceStartRef.current > noFaceThreshold * 1000 &&
            lastViolationRef.current !== "no_face"
          ) {
            lastViolationRef.current = "no_face";
            triggerViolation({
              type: "no_face",
              message: "User Face not detected. Instruct user to look into the camera and stay in frame.",
              timestamp: new Date(),
            });
          }
        } else {
          noFaceStartRef.current = null;
          if (lastViolationRef.current === "no_face") {
            lastViolationRef.current = null;
          }
        }

        // Multiple faces
        if (faceCount > 1 && lastViolationRef.current !== "multiple_faces") {
          lastViolationRef.current = "multiple_faces";
          triggerViolation({
            type: "multiple_faces",
            message: `Multiple faces detected (${faceCount}). instruct user to be visible, others need to frame out.`,
            timestamp: new Date(),
          });
        } else if (faceCount <= 1 && lastViolationRef.current === "multiple_faces") {
          lastViolationRef.current = null;
        }

        // Looking away
        if (eyeContact === "poor" || eyeContact === "lost") {
          if (!lookAwayStartRef.current) {
            lookAwayStartRef.current = now;
          } else if (
            now - lookAwayStartRef.current > lookAwayThreshold * 1000 &&
            lastViolationRef.current !== "looking_away"
          ) {
            lastViolationRef.current = "looking_away";
            triggerViolation({
              type: "looking_away",
              message: "User looking away. Instruct user to look into the camera and maintain eye contact.",
              timestamp: new Date(),
            });
          }
        } else {
          lookAwayStartRef.current = null;
          if (lastViolationRef.current === "looking_away") {
            lastViolationRef.current = null;
          }
        }

        // Head turned significantly
        if (
          headPosition !== "center" &&
          faceDetected &&
          lastViolationRef.current !== "head_turned"
        ) {
          if (
            lookAwayStartRef.current &&
            now - lookAwayStartRef.current > lookAwayThreshold * 1000
          ) {
            lastViolationRef.current = "head_turned";
            triggerViolation({
              type: "head_turned",
              message: `user head is turned ${headPosition}. instruct user to face the camera directly.`,
              timestamp: new Date(),
            });
          }
        }
      }
    } catch (err) {
      console.error("Face detection error:", err);
    }
  }, [videoRef, noFaceThreshold, lookAwayThreshold]);

  // Start detection loop
  const startDetection = useCallback(() => {
    const detect = async () => {
      await detectFaces();
      animationFrameRef.current = requestAnimationFrame(detect);
    };
    detect();
  }, [detectFaces]);

  // Stop detection loop
  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeDetector();
    return () => {
      stopDetection();
      if (detectorRef.current) {
        detectorRef.current.close();
      }
    };
  }, [initializeDetector, stopDetection]);

  // Start detection when video is ready and detector is loaded
  useEffect(() => {
    if (!isLoading && !error && videoRef.current) {
      const video = videoRef.current;
      const handlePlay = () => startDetection();
      const handlePause = () => stopDetection();

      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);

      if (!video.paused) {
        startDetection();
      }

      return () => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        stopDetection();
      };
    }
  }, [isLoading, error, videoRef, startDetection, stopDetection]);

  return {
    metrics,
    isLoading,
    error,
    startDetection,
    stopDetection,
  };
}

