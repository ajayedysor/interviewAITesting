"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useElevenLabs } from "@/hooks/use-elevenlabs";
import { useFaceDetection, FaceViolation } from "@/hooks/use-face-detection";
import FaceMetricsDisplay from "./FaceMetricsDisplay";

interface InterviewRoomProps {
  onEndInterview: () => void;
}

export default function InterviewRoom({ onEndInterview }: InterviewRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [violations, setViolations] = useState<FaceViolation[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // ElevenLabs hook - using sendRuntimeMessage for immediate response
  const {
    messages,
    connectionStatus,
    isLoading,
    error,
    isSpeaking,
    startInterview,
    stopInterview,
    sendRuntimeMessage, // <-- Changed back to sendRuntimeMessage
    interviewStartTime,
  } = useElevenLabs({
    onConnect: () => console.log("✅ Connected to ElevenLabs"),
    onDisconnect: () => console.log("🔴 Disconnected from ElevenLabs"),
    onError: (err) => console.error("❌ ElevenLabs error:", err),
  });

  // Track connection status in ref for use in violation handler
  const connectionStatusRef = useRef(connectionStatus);
  useEffect(() => {
    connectionStatusRef.current = connectionStatus;
  }, [connectionStatus]);

  // Queue for violations that occur before connection is established
  const pendingViolationsRef = useRef<FaceViolation[]>([]);

  // Process pending violations when connection is established
  useEffect(() => {
    if (connectionStatus === "connected" && pendingViolationsRef.current.length > 0) {
      console.log("📤 Processing pending violations...");
      const latestViolation = pendingViolationsRef.current[pendingViolationsRef.current.length - 1];
      const success = sendRuntimeMessage(latestViolation.message);
      if (success) {
        console.log("✅ Sent pending violation:", latestViolation.type);
      }
      pendingViolationsRef.current = [];
    }
  }, [connectionStatus, sendRuntimeMessage]);

  // Handle face violations
  const handleViolation = useCallback((violation: FaceViolation) => {
    console.log("⚠️ Violation detected:", violation.type, violation.message);
    setViolations((prev) => [...prev, violation]);
    
    // Show warning banner
    setWarningMessage(violation.message);
    setShowWarning(true);
    
    // Auto-hide warning after 5 seconds
    setTimeout(() => setShowWarning(false), 5000);
    
    // Check if connected before sending
    if (connectionStatusRef.current === "connected") {
      // Send runtime message - agent will respond immediately
      const success = sendRuntimeMessage(violation.message);
      if (success) {
        console.log("✅ Violation sent to agent - awaiting response");
      } else {
        console.warn("⚠️ Failed to send violation");
      }
    } else {
      // Queue violation for when connection is established
      console.log("⏳ Connection not ready, queueing violation for later");
      pendingViolationsRef.current.push(violation);
    }
  }, [sendRuntimeMessage]);

  // Face detection hook
  const {
    metrics: faceMetrics,
    isLoading: faceDetectionLoading,
    error: faceDetectionError,
  } = useFaceDetection(videoRef, {
    onViolation: handleViolation,
    noFaceThreshold: 2,
    lookAwayThreshold: 3,
  });

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }, []);

  // Initialize on mount (guarded to avoid double-invocation in StrictMode)
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    startCamera();
    startInterview();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Update interview duration
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (connectionStatus !== "connected" || !interviewStartTime) {
      return;
    }

    durationIntervalRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - interviewStartTime.getTime()) / 1000);
      setInterviewDuration(duration);
    }, 1000);

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [connectionStatus, interviewStartTime]);

  // Auto-scroll messages
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Toggle mute
  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // End interview
  const handleEndInterview = async () => {
    await stopInterview();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onEndInterview();
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get status color
  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-emerald-500";
      case "connecting":
        return "bg-yellow-500 animate-pulse";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="h-screen bg-[#1a1a2e] flex overflow-hidden">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-[#16162a] border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
              <span className="text-white/80 text-sm capitalize">{connectionStatus}</span>
            </div>
            <div className="text-white/60 text-sm">|</div>
            <div className="flex items-center gap-2 text-white/80">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-mono">{formatDuration(interviewDuration)}</span>
            </div>
          </div>

          <button
            onClick={handleEndInterview}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            End Interview
          </button>
        </header>

        {/* Warning Banner */}
        {showWarning && (
          <div className="bg-amber-500/20 border-b border-amber-500/30 px-6 py-3 flex items-center gap-3 animate-pulse">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-amber-200">{warningMessage}</span>
          </div>
        )}

        {/* Video Grid */}
        <div className="flex-1 p-6 grid grid-cols-2 gap-6">
          {/* User Video */}
          <div className="relative bg-[#0f0f1a] rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-contain"
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* Face Metrics Overlay */}
            <FaceMetricsDisplay
              metrics={faceMetrics}
              isLoading={faceDetectionLoading}
              error={faceDetectionError}
              className="absolute top-4 left-4"
            />

            {/* User Label */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="text-white text-sm font-medium">You</span>
              {isMuted && (
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </div>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition ${
                isMuted
                  ? "bg-red-500 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {isMuted ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          </div>

          {/* AI Interviewer */}
          <div className="relative bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl overflow-hidden flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
            {/* AI Avatar */}
            <div className="relative">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ${isSpeaking ? "animate-pulse" : ""}`}>
                <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              {/* Speaking indicator rings */}
              {isSpeaking && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-400/50 animate-ping" />
                  <div className="absolute -inset-2 rounded-full border border-indigo-400/30 animate-pulse" />
                </>
              )}
            </div>

            {/* AI Label */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="text-white text-sm font-medium">AI Interviewer</span>
              {isSpeaking && (
                <div className="flex items-center gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full animate-pulse"
                      style={{
                        height: `${8 + i * 4}px`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      <div className="w-96 bg-[#12121f] border-l border-white/5 flex flex-col h-screen overflow-hidden">
        {/* Chat Header */}
        <div className="h-16 px-6 flex items-center border-b border-white/5">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Transcript
          </h2>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#4f46e5 #1e1e2e'
          }}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-center">Conversation will appear here</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`${
                  message.role === "user"
                    ? "ml-auto bg-indigo-600/30 border-indigo-500/30"
                    : message.role === "ai"
                    ? "mr-auto bg-white/5 border-white/10"
                    : "mx-auto bg-transparent border-none text-gray-500 text-xs italic"
                } max-w-[85%] rounded-xl px-3 py-2 border`}
              >
                {message.role !== "system" && (
                  <div className="text-[10px] text-gray-400 mb-1">
                    {message.role === "user" ? "You" : "Interviewer"} • {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
                <p className={`text-sm leading-relaxed ${message.role === "system" ? "text-gray-500" : "text-gray-100"}`}>
                  {message.text}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Violations Log */}
        {violations.length > 0 && (
          <div className="border-t border-white/5 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Violations ({violations.length})
            </h3>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {violations.slice(-5).map((v, i) => (
                <div key={i} className="text-xs text-amber-400/80 flex items-center gap-1">
                  <span>⚠️</span>
                  <span className="truncate">{v.type.replace("_", " ")}</span>
                  <span className="text-gray-500 ml-auto">
                    {v.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}