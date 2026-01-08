"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaceDetector, FilesetResolver, FaceDetectorResult } from "@mediapipe/tasks-vision";

export interface FaceMetrics {
  faceDetected: boolean;
  faceCount: number;
  eyeContact: "good" | "poor" | "lost";
  headPosition: "center" | "left" | "right" | "up" | "down";
  isMouthOpen: boolean;
}

export interface Violation {
  type: string;
  message: string;
  timestamp: number;
}

interface UseFaceDetectionOptions {
  onViolation?: (violation: Violation) => void;
  noFaceThreshold?: number; // seconds
  lookAwayThreshold?: number; // seconds
}

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options: UseFaceDetectionOptions = {}
) {
  const { onViolation, noFaceThreshold = 3, lookAwayThreshold = 4 } = options;

  const [metrics, setMetrics] = useState<FaceMetrics>({
    faceDetected: false,
    faceCount: 0,
    eyeContact: "lost",
    headPosition: "center",
    isMouthOpen: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const detectorRef = useRef<FaceDetector | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastStateRef = useRef({
    noFaceStart: null as number | null,
    lookAwayStart: null as number | null,
    lastViolation: 0,
  });

  // Initialize MediaPipe Face Detector
  useEffect(() => {
    async function initDetector() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
        });
        detectorRef.current = detector;
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize MediaPipe Face Detector:", err);
        setError("Failed to load face detection models.");
        setIsLoading(false);
      }
    }
    initDetector();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      detectorRef.current?.close();
    };
  }, []);

  const detect = useCallback(() => {
    if (!detectorRef.current || !videoRef.current || videoRef.current.readyState < 2) {
      requestRef.current = requestAnimationFrame(detect);
      return;
    }

    const timestamp = performance.now();
    const result = detectorRef.current.detectForVideo(videoRef.current, timestamp);
    processResults(result);

    requestRef.current = requestAnimationFrame(detect);
  }, []);

  const processResults = (result: FaceDetectorResult) => {
    const faces = result.detections;
    const faceCount = faces.length;
    const faceDetected = faceCount > 0;
    const now = Date.now();

    let newMetrics: FaceMetrics = {
      faceDetected,
      faceCount,
      eyeContact: "lost",
      headPosition: "center",
      isMouthOpen: false,
    };

    if (faceDetected) {
      const face = faces[0];
      const keypoints = face.keypoints;
      
      // keypoints: 0=left eye, 1=right eye, 2=nose, 3=mouth, 4=left ear, 5=right ear
      if (keypoints && keypoints.length >= 6) {
        const leftEye = keypoints[0];
        const rightEye = keypoints[1];
        const nose = keypoints[2];
        const leftEar = keypoints[4];
        const rightEar = keypoints[5];

        // Horizontal position (Yaw heuristic)
        const leftDist = Math.abs(nose.x - leftEar.x);
        const rightDist = Math.abs(nose.x - rightEar.x);
        const ratio = leftDist / rightDist;

        if (ratio > 2.5) newMetrics.headPosition = "right";
        else if (ratio < 0.4) newMetrics.headPosition = "left";
        else newMetrics.headPosition = "center";

        // Vertical position (Pitch heuristic)
        const eyeY = (leftEye.y + rightEye.y) / 2;
        const noseY = nose.y;
        if (noseY - eyeY < 0.02) newMetrics.headPosition = "up";
        // Simple heuristic for down is harder without baseline, skipping for now

        // Eye contact (Simplified: if looking too far left/right/up)
        if (newMetrics.headPosition !== "center") {
            newMetrics.eyeContact = "poor";
            if (!lastStateRef.current.lookAwayStart) {
                lastStateRef.current.lookAwayStart = now;
            } else if (now - lastStateRef.current.lookAwayStart > lookAwayThreshold * 1000) {
                if (now - lastStateRef.current.lastViolation > 15000) {
                    onViolation?.({
                        type: "eye_contact",
                        message: "I've noticed you're looking away from the screen. Please try to maintain eye contact with me.",
                        timestamp: now
                    });
                    lastStateRef.current.lastViolation = now;
                }
            }
        } else {
            newMetrics.eyeContact = "good";
            lastStateRef.current.lookAwayStart = null;
        }
      }

      // Reset no-face timer
      lastStateRef.current.noFaceStart = null;
      
      // Violation Check: Multiple People
      if (faceCount > 1 && now - lastStateRef.current.lastViolation > 10000) {
          onViolation?.({
              type: "multiple_people",
              message: "I've noticed another person in your frame. Please ensure you are alone during this interview.",
              timestamp: now
          });
          lastStateRef.current.lastViolation = now;
      }

    } else {
        // Person not detected
        newMetrics.eyeContact = "lost";
        if (!lastStateRef.current.noFaceStart) {
            lastStateRef.current.noFaceStart = now;
        } else if (now - lastStateRef.current.noFaceStart > noFaceThreshold * 1000) {
            if (now - lastStateRef.current.lastViolation > 15000) {
                onViolation?.({
                    type: "no_face",
                    message: "I cannot see you. Please make sure your face is clearly visible to the camera.",
                    timestamp: now
                });
                lastStateRef.current.lastViolation = now;
            }
        }
    }

    setMetrics(newMetrics);
  };

  const startDetection = useCallback(() => {
    detect();
  }, [detect]);

  const stopDetection = useCallback(() => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  }, []);

  return {
    metrics,
    isLoading,
    error,
    startDetection,
    stopDetection,
  };
}
