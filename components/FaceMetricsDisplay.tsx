"use client";

import { FaceMetrics } from "@/hooks/use-face-detection";

interface FaceMetricsDisplayProps {
  metrics: FaceMetrics;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export default function FaceMetricsDisplay({
  metrics,
  isLoading,
  error,
  className = "",
}: FaceMetricsDisplayProps) {
  if (isLoading) {
    return (
      <div className={`bg-black/60 backdrop-blur-sm rounded-lg p-3 text-xs ${className}`}>
        <div className="flex items-center gap-2 text-yellow-400">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading face detection...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-black/60 backdrop-blur-sm rounded-lg p-3 text-xs ${className}`}>
        <div className="flex items-center gap-2 text-red-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Face detection error</span>
        </div>
      </div>
    );
  }

  const getEyeContactColor = () => {
    switch (metrics.eyeContact) {
      case "good":
        return "text-emerald-400";
      case "poor":
        return "text-yellow-400";
      case "lost":
        return "text-red-400";
    }
  };

  const getHeadPositionIcon = () => {
    switch (metrics.headPosition) {
      case "center":
        return "⬤";
      case "left":
        return "◀";
      case "right":
        return "▶";
      case "up":
        return "▲";
      case "down":
        return "▼";
    }
  };

  return (
    <div className={`bg-black/70 backdrop-blur-sm rounded-lg p-3 text-xs space-y-2 min-w-[160px] ${className}`}>
      {/* Face Detection Status */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-gray-400">Face</span>
        <span className={metrics.faceDetected ? "text-emerald-400" : "text-red-400"}>
          {metrics.faceDetected ? "✅ Detected" : "❌ Not Found"}
        </span>
      </div>

      {/* Face Count */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-gray-400">Faces</span>
        <span className={metrics.faceCount > 1 ? "text-red-400 font-semibold" : "text-gray-200"}>
          {metrics.faceCount} {metrics.faceCount > 1 && "⚠️"}
        </span>
      </div>

      {/* Eye Contact */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-gray-400">Eye Contact</span>
        <span className={`capitalize ${getEyeContactColor()}`}>
          {metrics.eyeContact}
        </span>
      </div>

      {/* Head Position */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-gray-400">Head</span>
        <span className={`capitalize ${metrics.headPosition === "center" ? "text-emerald-400" : "text-yellow-400"}`}>
          {getHeadPositionIcon()} {metrics.headPosition}
        </span>
      </div>
    </div>
  );
}

