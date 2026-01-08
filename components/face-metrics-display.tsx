"use client";

import { useState } from "react";
import { Eye, ChevronDown, ChevronUp } from "lucide-react";

export interface FaceMetrics {
  faceDetected: boolean;
  faceCount: number;
  eyeContact: "good" | "poor" | "lost";
  headPosition: "center" | "left" | "right" | "up" | "down";
  isMouthOpen: boolean;
}

interface FaceMetricsDisplayProps {
  data: FaceMetrics;
  isActive: boolean;
}

export function FaceMetricsDisplay({ data, isActive }: FaceMetricsDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getEyeContactColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-500";
      case "poor": return "text-yellow-500";
      default: return "text-red-500";
    }
  };

  const getHeadPositionColor = (pos: string) => {
      return pos === "center" ? "text-green-500" : "text-yellow-500";
  };

  if (!isActive) {
    return (
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4" />
          <span>AI Monitoring: Off</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 bg-black/80 text-white rounded-lg overflow-hidden min-w-[200px]">
      <div 
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-black/90"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 ${data.faceDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} rounded-full`} />
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">AI Monitoring</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2"> 
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Face Detected:</span>
            <span className={data.faceDetected ? "text-green-500" : "text-red-500"}>
              {data.faceDetected ? "YES" : "NO"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Face Count:</span>
            <span className={data.faceCount > 1 ? "text-red-500 font-bold" : "text-white"}>
              {data.faceCount}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Eye Contact:</span>
            <span className={`font-medium uppercase ${getEyeContactColor(data.eyeContact)}`}>
              {data.eyeContact}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Head Position:</span>
            <span className={`font-medium uppercase ${getHeadPositionColor(data.headPosition)}`}>
              {data.headPosition}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
