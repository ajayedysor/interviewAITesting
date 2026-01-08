"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useElevenLabs } from "@/hooks/use-elevenlabs"
import { useFaceDetection } from "@/hooks/use-face-detection"
import {
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Play,
  Pause,
  ChevronUp,
  Monitor,
  Camera,
  Smile,
  Grid3X3,
  Hand,
  MoreHorizontal,
  Info,
  Users,
  MessageSquare,
  LayoutGrid,
  Shield,
  AlertCircle,
  X,
} from "lucide-react"
import { Button } from "./ui/button"
import { FaceMetricsDisplay } from "./face-metrics-display"
import { SpeechIndicator } from "./meeting-preview";
import { useToast } from "./ui/use-toast";

export function InterviewRoom({ 
  onEnd, 
  meetingId, 
  interviewer, 
  user, 
  university, 
  interview
}: { 
  onEnd?: () => void; 
  meetingId?: string; 
  interviewer?: { name?: string; avatarUrl?: string | null };
  user?: { name?: string; userSummary?: string; passportNumber?: string } | null;
  university?: { name?: string; questions?: string | null; question_bank?: string | null } | null;
  interview?: { course?: string } | null;
}) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hasPermissions, setHasPermissions] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  // Create variable values for Vapi assistant override
  const variableValues = {
    name: user?.name || "",
    course: interview?.course || "",
    university: university?.name || "",
    userSummary: user?.userSummary || "",
    passportNumber: user?.passportNumber || "",
    questions: university?.questions || "",
  }

  const [reconnectingAudio, setReconnectingAudio] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const MAX_AUDIO_RECONNECT_ATTEMPTS = 3;
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioHealthStatus, setAudioHealthStatus] = useState<'healthy' | 'warning' | 'error'>('healthy');
  const audioHealthCheckRef = useRef<NodeJS.Timeout | null>(null);
  const audioRecoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAudioActivityRef = useRef<number>(Date.now());
  const audioSilenceThreshold = 30000; // 30 seconds of silence before warning
  const PREFERRED_MIC_STORAGE_KEY = 'preferredMicDeviceId';

  const handleCallEnd = (endedReason?: string) => {
    setIsStarting(false);
    const reason = endedReason || 'assistant-ended-call';
    
    const completedReasons = [
      'assistant-ended-call',
      'customer-ended-call',
    ];
    
    endInterview(completedReasons.includes(reason) ? 'COMPLETED' : 'PENDING');
  };

  const {
    messages,
    connectionStatus,
    isLoading: isElevenLabsLoading,
    error: elevenLabsError,
    isSpeaking,
    startInterview: startElevenLabs,
    stopInterview: stopElevenLabs,
    sendRuntimeMessage,
  } = useElevenLabs({
    onConnect: () => setIsStarting(false),
    onDisconnect: () => handleCallEnd('assistant-ended-call'),
    onError: (err) => {
      setIsStarting(false);
      handleAudioRecovery();
    }
  });

  const isCalling = connectionStatus === 'connected';
  const isConfigured = true;
  const configError = elevenLabsError;
  const volumeLevel = isSpeaking ? 0.5 : 0;

  useEffect(() => {
    if (isCalling && reconnectAttempts > 0) {
      setReconnectAttempts(0);
    }
  }, [isCalling]);

  // Enhanced audio health monitoring
  const startAudioHealthMonitoring = useCallback(() => {
    if (audioHealthCheckRef.current) {
      clearInterval(audioHealthCheckRef.current);
    }

    audioHealthCheckRef.current = setInterval(() => {
      if (!audioStream || !isCalling) return;

      const audioTracks = audioStream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) {
        console.error("No audio tracks found during health check");
        setAudioHealthStatus('error');
        handleAudioRecovery();
        return;
      }

      const audioTrack = audioTracks[0];
      const now = Date.now();

      // Check audio track state
      if (audioTrack.readyState !== 'live') {
        console.error("Audio track not live during health check:", audioTrack.readyState);
        setAudioHealthStatus('error');
        handleAudioRecovery();
        return;
      }

      if (!audioTrack.enabled) {
        console.warn("Audio track is disabled during call");
        setAudioHealthStatus('warning');
        // Try to re-enable the track
        audioTrack.enabled = true;
        return;
      }

      // Check for prolonged silence (no volume level updates)
      if (volumeLevel === 0 && (now - lastAudioActivityRef.current) > audioSilenceThreshold) {
        console.warn("Prolonged audio silence detected");
        setAudioHealthStatus('warning');
        // Don't immediately recover for silence, just warn
        return;
      }

      // Update last activity if we have volume
      if (volumeLevel > 0) {
        lastAudioActivityRef.current = now;
      }

      setAudioHealthStatus('healthy');
    }, 2000); // Check every 2 seconds
  }, [audioStream, isCalling, volumeLevel]);

  // Stop audio health monitoring
  const stopAudioHealthMonitoring = useCallback(() => {
    if (audioHealthCheckRef.current) {
      clearInterval(audioHealthCheckRef.current);
      audioHealthCheckRef.current = null;
    }
    if (audioRecoveryTimeoutRef.current) {
      clearTimeout(audioRecoveryTimeoutRef.current);
      audioRecoveryTimeoutRef.current = null;
    }
  }, []);

  // Handle audio recovery
  const handleAudioRecovery = useCallback(async () => {
    if (reconnectAttempts >= MAX_AUDIO_RECONNECT_ATTEMPTS) {
      console.error("Max audio recovery attempts reached");
      setAudioError('Audio connection failed after multiple attempts. Please check your microphone and try again.');
      endInterview('PENDING');
      return;
    }

        // Attempting audio recovery;
    setReconnectingAudio(true);
    setAudioError('Reconnecting audio... Please wait.');

    try {
      // Stop ElevenLabs call
      if (isCalling) {
        await stopElevenLabs();
      }

      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reacquire audio stream
      const newStream = await (async () => {
        let preferredMicId: string | null = null;
        try { preferredMicId = typeof window !== 'undefined' ? localStorage.getItem(PREFERRED_MIC_STORAGE_KEY) : null; } catch {}
        try {
          return await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: {
              deviceId: preferredMicId ? { exact: preferredMicId } : undefined,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000,
              channelCount: 1
            } 
          });
        } catch (e) {
          return await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000,
              channelCount: 1
            } 
          });
        }
      })();

      // Validate the new stream
      const audioTracks = newStream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) {
        throw new Error("No audio tracks in new stream");
      }

      const audioTrack = audioTracks[0];
      if (audioTrack.readyState !== 'live') {
        throw new Error("New audio track not live");
      }

      // Create separate streams for audio and video
      const newAudioOnlyStream = new MediaStream(newStream.getAudioTracks())
      const newVideoOnlyStream = new MediaStream(newStream.getVideoTracks())
      
      // Update both streams
      setAudioStream(newAudioOnlyStream);  // For VAPI
      setVideoStream(newVideoOnlyStream);  // For face detection
      
      setReconnectAttempts(prev => prev + 1);
      setAudioError(null);
      setReconnectingAudio(false);

      // Wait for React to process the state updates
      await new Promise(resolve => setTimeout(resolve, 100));

      // Restart ElevenLabs call with new audio stream
      setTimeout(() => {
        if (newAudioOnlyStream && isAudioTrackLive(newAudioOnlyStream)) {
          startInterview();
        } else {
          throw new Error("Failed to validate new audio stream");
        }
      }, 1000);

    } catch (error) {
      console.error("Audio recovery failed:", error);
      setAudioError('Audio recovery failed. Please check your microphone and try again.');
      setReconnectingAudio(false);
      
      // Retry after delay
      audioRecoveryTimeoutRef.current = setTimeout(() => {
        handleAudioRecovery();
      }, 3000);
    }
  }, [reconnectAttempts, isCalling, stop]);

  // Start/stop audio health monitoring based on call state
  useEffect(() => {
    if (isCalling && audioStream) {
      startAudioHealthMonitoring();
    } else {
      stopAudioHealthMonitoring();
      setAudioHealthStatus('healthy');
    }

    return () => {
      stopAudioHealthMonitoring();
    };
  }, [isCalling, audioStream, startAudioHealthMonitoring, stopAudioHealthMonitoring]);

  // Update last audio activity when volume level changes
  useEffect(() => {
    if (volumeLevel > 0) {
      lastAudioActivityRef.current = Date.now();
    }
  }, [volumeLevel]);

  const { 
    metrics: processedData, 
    isLoading: isFaceDetectionLoading, 
    error: faceDetectionError,
    startDetection, 
    stopDetection 
  } = useFaceDetection(videoRef, {
    onViolation: (violation) => {
      if (isCalling) {
        // Prefix as system notification so the agent knows it's an automated alert
        sendRuntimeMessage(`[SYSTEM NOTIFICATION] ${violation.message}`);
      }
    },
    noFaceThreshold: 2,
    lookAwayThreshold: 3,
  })

  const isFaceDetectionActive = !isFaceDetectionLoading && !faceDetectionError;
  const isProcessorReady = !isFaceDetectionLoading;
  const photoIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const randomPhotoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [showTabWarning, setShowTabWarning] = useState(false)
  const [tabChangeCount, setTabChangeCount] = useState(0)
  // Violation debounce state
  const violationCooldownRef = useRef(false)
  const [hasEnded, setHasEnded] = useState(false);
  const [multipleScreens, setMultipleScreens] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const { toast } = useToast();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Check permissions and initialize camera
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        setIsCheckingPermissions(true)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        // Enhanced microphone health check during permission phase
        const audioTracks = stream.getAudioTracks();
        if (!audioTracks || audioTracks.length === 0) {
          throw new Error("No microphone detected");
        }
        
        const audioTrack = audioTracks[0];
        if (audioTrack.readyState !== 'live') {
          throw new Error("Microphone not working properly");
        }
        
        if (!audioTrack.enabled) {
          throw new Error("Microphone is disabled");
        }
        
        // Test microphone settings
        try {
          const settings = audioTrack.getSettings();
          if (!settings.deviceId) {
            throw new Error("Microphone not properly configured");
          }
          // Remember preferred microphone for future starts/recovery
          if (typeof window !== 'undefined' && settings.deviceId) {
            try { localStorage.setItem(PREFERRED_MIC_STORAGE_KEY, settings.deviceId); } catch {}
          }
        } catch (settingsError) {
          throw new Error("Microphone configuration error");
        }

        // Create separate streams for audio and video
        const audioOnlyStream = new MediaStream(stream.getAudioTracks())
        const videoOnlyStream = new MediaStream(stream.getVideoTracks())
        
        // Streams created successfully
        
        // Set both streams
        setAudioStream(audioOnlyStream)  // For VAPI
        setVideoStream(videoOnlyStream)  // For face detection and preview

        // Only use video tracks for preview and face detection
        if (videoRef.current && isVideoOn) {
          videoRef.current.srcObject = videoOnlyStream
        }

        setHasPermissions(true)
        setPermissionError(null)
      } catch (error) {
        console.error("Error accessing camera/microphone:", error)
        setHasPermissions(false)

        if (error instanceof Error) {
          // Enhanced error messages for microphone issues
          if (error.message === "No microphone detected") {
            setPermissionError("No microphone detected. Please connect a microphone and try again.")
          } else if (error.message === "Microphone not working properly") {
            setPermissionError("Microphone is not working properly. Please check your microphone and try again.")
          } else if (error.message === "Microphone is disabled") {
            setPermissionError("Microphone is disabled. Please enable your microphone and try again.")
          } else if (error.message === "Microphone not properly configured") {
            setPermissionError("Microphone not properly configured. Please check your microphone settings.")
          } else if (error.message === "Microphone configuration error") {
            setPermissionError("Microphone configuration error. Please check your microphone and try again.")
          } else if (error.name === "NotAllowedError") {
            setPermissionError("Camera and microphone access denied. Please allow permissions to start the interview.")
          } else if (error.name === "NotFoundError") {
            setPermissionError("No camera or microphone found. Please connect your devices.")
          } else {
            setPermissionError("Unable to access camera or microphone. Please check your device settings.")
          }
        }
        setIsVideoOn(false)
      } finally {
        setIsCheckingPermissions(false)
      }
    }

    checkPermissions()
  }, [isVideoOn])

  // Start/stop face detection based on video state
useEffect(() => {
  if (isVideoOn && videoStream && hasPermissions && isProcessorReady) {
    startDetection()
  } else {
    stopDetection()
  }
}, [isVideoOn, videoStream, hasPermissions, isProcessorReady, startDetection, stopDetection])

  // Helper to capture and upload photo, returns the S3 URL if successful
  const captureAndUploadPhoto = async (title?: string, violation: boolean = false) => {
    // Only require calling state for random photos, not for violation screenshots
    if (!isCalling && !violation) {
              // Photo upload: Not in call, skipping
      return null
    }
    if (!videoRef.current) {
              // Photo upload: No video ref, skipping
      return null
    }
    if (!isVideoOn) {
              // Photo upload: Video is off, skipping
      return null
    }
    
    const video = videoRef.current
    
    // Check if video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
              // Photo upload: Video not ready, skipping
      return null
    }
    
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas")
    }
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) {
              // Photo upload: Could not get canvas context
      return null
    }
    
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      // Compress to JPEG, quality 0.5
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.5))
      if (!blob) {
        // Photo upload: Could not create blob from canvas
        return null
      }
      
      // Upload to S3 via API route
      const fileName = `photo_${Date.now()}.jpg`
      const formData = new FormData()
      formData.append("file", blob, fileName)
      formData.append("interviewId", meetingId || "")
      formData.append("uploadType", "evidence")
      formData.append("title", title || "Random Photo Taken")
      formData.append("violation", violation.toString())
      
              // Photo upload started
      const res = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      })
      
      if (res.ok) {
        const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET
        const region = process.env.NEXT_PUBLIC_AWS_S3_REGION
        const url = `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`
        // Photo uploaded to S3
        return url
      } else {
        console.error("[PHOTO UPLOAD] Upload failed with status:", res.status)
        const errorText = await res.text()
        console.error("[PHOTO UPLOAD] Error response:", errorText)
      }
    } catch (err) {
      console.error("[PHOTO UPLOAD] Upload error:", err)
    }
    return null
  }

  // Face violations are now handled by the useFaceDetection hook's onViolation callback
  // which directly calls sendRuntimeMessage. No need for event listeners.

  // Listen for tab visibility change - capture violation from video feed
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState === "hidden") {
        setTabChangeCount(prev => {
          const newCount = prev + 1
          // Wait 1 second before capturing to allow the screen to update
          setTimeout(async () => {
            // Capture violation from user's video feed instead of screenshot
            await captureAndUploadPhoto(`Tab Change Violation - User Left Interview Tab (Tab Changes: ${newCount})`, true)
          }, 1000)
          return newCount
        })
        setShowTabWarning(true)
        // Wait 1 second before capturing to allow the screen to update
        setTimeout(async () => {
          // Capture violation from user's video feed instead of screenshot
          await captureAndUploadPhoto("Tab Change Violation - User Left Interview Tab", true)
        }, 1000)
      } else {
        setShowTabWarning(false)
        // Don't end the interview when returning to the tab
        // Just clear the warning and continue
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, []) // Remove isCalling dependency since we want this to work regardless of call state

  // Robust recovery for tab visibility changes
  useEffect(() => {
    let reconnectingNow = false;
    const handleVisibility = async () => {
      if (document.visibilityState === "visible" && !reconnectingNow) {
        reconnectingNow = true;
        setReconnecting(true);
        try {
          // Stop face detection and video stream if running
          stopDetection && stopDetection();
          if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
          }
          setVideoStream(null);
          setAudioStream(null);
          // Re-initialize camera and face detection
          const stream = await (async () => {
            let preferredMicId: string | null = null;
            try { preferredMicId = typeof window !== 'undefined' ? localStorage.getItem(PREFERRED_MIC_STORAGE_KEY) : null; } catch {}
            try {
              return await navigator.mediaDevices.getUserMedia({ video: true, audio: preferredMicId ? { deviceId: { exact: preferredMicId } } : true });
            } catch (e) {
              return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            }
          })();
          
          // Create separate streams for audio and video
          const audioOnlyStream = new MediaStream(stream.getAudioTracks())
          const videoOnlyStream = new MediaStream(stream.getVideoTracks())
          
          setAudioStream(audioOnlyStream);  // For VAPI
          setVideoStream(videoOnlyStream);  // For face detection
          setHasPermissions(true);
          setPermissionError(null);
          
          // Only use video tracks for preview and face detection
          if (videoRef.current) {
            videoRef.current.srcObject = videoOnlyStream;
          }
          startDetection && startDetection();
          setReconnecting(false);
        } catch (error) {
          window.location.reload();
        } finally {
          reconnectingNow = false;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Handle browser back/refresh/navigation attempts
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isCalling && !hasEnded) {
        // Show browser's default confirmation dialog
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? The interview will end.';
        return 'Are you sure you want to leave? The interview will end.';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (isCalling && !hasEnded) {
        e.preventDefault();
        setIsLeaving(true);
        // Show custom confirmation dialog
        const confirmed = window.confirm('Are you sure you want to leave? The interview will end.');
        if (confirmed) {
          endInterview();
        } else {
          setIsLeaving(false);
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    // Push initial state to enable popstate detection
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isCalling, hasEnded]);

  // Helper to get a random interval between 3-6 minutes (in ms)
  function getRandomInterval() {
    return 1 * 60 * 1000 + Math.random() * 3 * 60 * 1000 // 1-4 min
  }

  // Random photo capture effect
  useEffect(() => {
    if (!isCalling) return; // Only run when call is active
    
    let stopped = false
    function scheduleNext() {
      if (stopped) return
      const interval = getRandomInterval()
              // Random photo capture scheduled
      
      randomPhotoTimeoutRef.current = setTimeout(async () => {
        if (stopped) return
        // Taking random photo
        const result = await captureAndUploadPhoto("Random Photo Taken", false)
        if (result) {
          // Random photo uploaded successfully
        } else {
          // Random photo upload failed
        }
        scheduleNext() // Schedule next photo
      }, interval)
    }
    
    // Add a small delay to ensure video is ready before starting photo capture
    const initialDelay = setTimeout(() => {
      if (!stopped) {
        // Random photo capture system started
        scheduleNext()
      }
    }, 5000) // 5 second delay to ensure video is loaded
    
    return () => {
      stopped = true
      clearTimeout(initialDelay)
      if (randomPhotoTimeoutRef.current) {
        clearTimeout(randomPhotoTimeoutRef.current)
        randomPhotoTimeoutRef.current = null
      }
    }
  }, [isCalling, meetingId, isVideoOn]) // Added isVideoOn to dependencies

  // Monitor for multiple screens
  useEffect(() => {
    let details: any;
    let handler: (() => void) | undefined;
    async function setupScreenListener() {
      if ('getScreenDetails' in window) {
        // @ts-ignore
        details = await window.getScreenDetails();
        setMultipleScreens(details.screens.length > 1);
        handler = () => {
          setMultipleScreens(details.screens.length > 1);
          if (details.screens.length > 1) {
            // End interview immediately
            endInterview();
            alert('Multiple screens detected. Interview ended.');
          }
        };
        details.addEventListener('screenschange', handler);
      }
    }
    setupScreenListener();
    return () => {
      if (details && handler) details.removeEventListener('screenschange', handler);
    };
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (audioStream) {
        audioStream.getAudioTracks().forEach((track) => {
          track.enabled = !newMuted;
        });
      }
      return newMuted;
    });
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const videoTracks = stream.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !isVideoOn
      })
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const endInterview =  (statusOverride?: 'COMPLETED' | 'PENDING') => {
    setIsEnding(true);
    
    // Stop ElevenLabs call
    if (isCalling) {
      stopElevenLabs()
    }
    
    // Clean up camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null;
    }
    
    // Clean up video stream state
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
    
    // Clean up audio stream state
    if (audioStream) {
      audioStream.getAudioTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }
    
    // Stop face detection
    stopDetection && stopDetection();
    
    // Clear all timeouts and intervals
    if (photoIntervalRef.current) {
      clearInterval(photoIntervalRef.current);
      photoIntervalRef.current = null;
    } 
    if (randomPhotoTimeoutRef.current) {
      clearTimeout(randomPhotoTimeoutRef.current);
      randomPhotoTimeoutRef.current = null;
    }
    
    // Reset all states
    setIsVideoOn(false);
    setIsMuted(true);
    setPermissionError(null);
    
    // Update interview status
    if (meetingId) {
      try {
        fetch('/api/interviews/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interviewId: meetingId,
            status: statusOverride || 'COMPLETED',
            endedAt: new Date().toISOString(),
          }),
        });
        
        
      } catch (error) {
        console.error('Error updating interview status:', error);
      }
    }
    setHasEnded(true);
    if (onEnd) onEnd();
  }

  // Helper to check if audio track is live and enabled
  function isAudioTrackLive(stream: MediaStream | null) {
    const audioTrack = stream?.getAudioTracks?.()[0];
    return (
      audioTrack &&
      audioTrack.readyState === 'live' &&
      audioTrack.enabled
    );
  }

  const startInterview = () => {
    if (!hasPermissions) {
      setPermissionError("Please allow camera and microphone access first.")
      return
    }
    
    // Enhanced microphone health check before starting VAPI call
    if (!audioStream) {
      setPermissionError("No audio stream available. Please check your microphone.");
      return;
    }
    
    const audioTracks = audioStream.getAudioTracks();
    if (!audioTracks || audioTracks.length === 0) {
      setPermissionError("No microphone detected. Please connect a microphone and try again.");
      return;
    }
    
    const audioTrack = audioTracks[0];
    if (!audioTrack) {
      setPermissionError("Microphone not available. Please check your microphone connection.");
      return;
    }
    
    // Check if audio track is in a healthy state
    if (audioTrack.readyState !== 'live') {
      setPermissionError("Microphone is not working properly. Please check your microphone and try again.");
      return;
    }
    
    if (!audioTrack.enabled) {
      setPermissionError("Microphone is disabled. Please enable your microphone and try again.");
      return;
    }
    
    // Additional check: verify audio track has proper settings
    try {
      const settings = audioTrack.getSettings();
      if (!settings.deviceId) {
        setPermissionError("Microphone device not properly configured. Please check your microphone settings.");
        return;
      }
    } catch (error) {
      setPermissionError("Microphone configuration error. Please check your microphone and try again.");
      return;
    }
    
    if (!isConfigured) {
      setPermissionError("Interview system is still initializing. Please wait a moment and try again.");
      return;
    }
    
    // Validate the audio stream for VAPI
    try {
      // audioStream is already audio-only, just validate it
      if (!audioStream.getAudioTracks().length) {
        setPermissionError("Failed to validate audio stream for interview. Please try again.");
        return;
      }
      
      // Audio stream validated for VAPI
      
    } catch (error) {
      console.error("Error validating audio stream for VAPI:", error);
      setPermissionError("Failed to prepare audio for interview. Please try again.");
      return;
    }
    
    // Defer slightly to avoid race conditions with device initialization and tab visibility
    const visible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
    const delay = visible ? 250 : 750
    setIsStarting(true)
    setTimeout(() => {
      startElevenLabs()
    }, delay)
    
    // Monitor audio track during the call
    if (audioTrack) {
      audioTrack.onended = () => {
        setPermissionError("Microphone disconnected. Please reconnect your mic and rejoin the interview.");
        if (isCalling) stopElevenLabs();
      };
      audioTrack.onmute = () => {
        setPermissionError("Microphone is muted. Please unmute to continue the interview.");
      };
      audioTrack.onunmute = () => {
        setPermissionError(null);
      };
    }
  }

  // Auto-start interview when component mounts and permissions are granted
  useEffect(() => {
    if (hasPermissions && !isCheckingPermissions && isConfigured && !configError && !isCalling && !hasEnded) {
      // Additional warm-up: ensure audio track is live and not muted before starting
      const warmupAndStart = () => {
        const track = audioStream?.getAudioTracks?.()[0]
        const isTrackLive = !!(track && track.readyState === 'live')
        const isTrackEnabled = !!(track && track.enabled)
        const isVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true
        if (isTrackLive && isTrackEnabled && isVisible) {
          startInterview()
        } else {
          // Retry shortly until conditions are good
          setTimeout(warmupAndStart, 200)
        }
      }
      const timer = setTimeout(warmupAndStart, 400)
      return () => clearTimeout(timer)
    }
  }, [hasPermissions, isCheckingPermissions, isConfigured, configError, isCalling, hasEnded, audioStream])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  return (
    <div className="h-screen bg-[#131314] flex flex-col">
      {/* Banners and Alerts - now bottom center */}
      <div className="fixed left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2" style={{ bottom: 16, top: 'auto' }}>
        {reconnecting && (
          <div className="bg-blue-900 text-white px-6 py-3 rounded shadow-lg text-lg font-semibold max-w-lg text-center animate-pulse">
            Reconnecting... Please wait
          </div>
        )}
        {showTabWarning && (
          <div className="bg-yellow-500 text-black px-4 py-2 rounded shadow-lg text-sm font-semibold">
            ⚠️ Tab Change Detected! Please return to the interview tab immediately. Violation has been recorded. (Tab Changes: {tabChangeCount})
            <div className="text-xs mt-1 font-normal">
              ⚠️ This is prohibited and all your movements are being captured please don't do this again!
            </div>
          </div>
        )}

        {isStarting && (
          <div className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg text-sm font-semibold">
            Starting interview...
          </div>
        )}

        {/* Audio Health Status Indicators */}
        {isCalling && audioHealthStatus === 'warning' && (
          <div className="bg-orange-500 text-white px-4 py-2 rounded shadow-lg text-sm font-semibold">
            ⚠️ Audio Warning: Please check your microphone
          </div>
        )}
        
        {isCalling && audioHealthStatus === 'error' && (
          <div className="bg-red-600 text-white px-4 py-2 rounded shadow-lg text-sm font-semibold">
            🔴 Audio Error: Reconnecting microphone...
          </div>
        )}

        {reconnectingAudio && (
          <div className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg text-sm font-semibold animate-pulse">
            🔄 Reconnecting audio... Please wait
          </div>
        )}
      </div>

      {multipleScreens && (
        <div className="fixed top-0 left-0 w-full z-50 bg-red-600 text-white px-4 py-2 text-center font-semibold">
          Multiple screens detected. Interview will end immediately.
        </div>
      )}

      {/* Tab Change Counter - Top center when there are tab changes */}
      {tabChangeCount > 0 && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white px-6 py-3 rounded-b-lg shadow-lg text-sm font-semibold text-center max-w-md">
          📊 Tab Changes: {tabChangeCount}
          <div className="text-xs mt-1 font-normal">
            ⚠️ This is prohibited and all your movements are being captured please don't do this again!
          </div>
        </div>
      )}

      {/* Main Video Area */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Interviewer Profile (now shows profile image and name) */}
        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl overflow-hidden">
          <div className="aspect-video w-full h-full flex items-center justify-center bg-gray-800">
            {/* Profile Image or Fallback */}
            <div className="relative flex flex-col items-center justify-center">
              {/* Audio ripple effects (Google Meet style, filled and smooth, grey, no blur, larger radius, smoother transitions) */}
              {isCalling && (
                  <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-400/50 transition-all duration-500 ease-in-out"
                    style={{
                    width: `${140 + Math.max(0, volumeLevel - 0.1) * 60}px`,
                    height: `${140 + Math.max(0, volumeLevel - 0.1) * 60}px`,
                    opacity: 0.3 + Math.max(0, volumeLevel - 0.1) * 0.7,
                    zIndex: 1,
                  }}
                />
              )}
              {interviewer?.avatarUrl ? (
                <img
                  src={interviewer.avatarUrl}
                  alt={interviewer.name ? `${interviewer.name} avatar` : 'Interviewer avatar'}
                  className="w-32 h-32 rounded-full object-cover shadow-lg relative z-10"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-lg relative z-10">
                  {interviewer?.name ? interviewer.name.charAt(0).toUpperCase() : 'AI'}
                </div>
              )}
              </div>
            {/* Interviewer name in bottom left */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {interviewer?.name || 'AI Interviewer'}
            </div>
          </div>
        </div>
        {/* Student Video */}
        <div className="relative bg-black rounded-3xl overflow-hidden">
          {isVideoOn ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted={true}
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              <FaceMetricsDisplay data={processedData as any} isActive={isFaceDetectionActive} />
            </>
          ) : (
            <div className="aspect-video w-full h-full flex items-center justify-center bg-black">
              {/* Profile Circle when camera is off */}
              <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                <VideoOff className="w-8 h-8" />
              </div>
            </div>
          )}
          {/* User name in bottom left */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
            You
          </div>
          {/* Microphone status indicator in top right */}
          <div className="absolute top-4 right-4">
            <div className="bg-blue-600 rounded-full flex items-center justify-center h-[30px] w-[30px]">
              <SpeechIndicator isMuted={isMuted} volumeLevel={volumeLevel} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls - Google Meet Style */}
      <div className="bg-[#131314] px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Time and Meeting Code */}
          <div className="flex items-center space-x-4 text-white">
            <span className="text-sm font-medium">{formatTime(currentTime)}</span>
            
          </div>

          {/* Center Controls */}
          <div className="flex items-center space-x-3">
            {/* Microphone - Disabled */}
            <button
              disabled
              className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 bg-[#333537] cursor-not-allowed"
              aria-label="Microphone disabled"
              title="Microphone is disabled during interview"
            >
              <Mic className="w-6 h-6" />
            </button>

            {/* Camera - Disabled */}
            <button
              disabled
              className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 bg-[#333537] cursor-not-allowed"
              aria-label="Camera disabled"
              title="Camera is disabled during interview"
            >
              <Camera className="w-6 h-6" />
            </button>

            {/* End Call */}
            {isCalling ? (
              <button
                onClick={() => endInterview()}
                className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-colors text-xl ml-2 focus:outline-none"
                aria-label="End call"
                title="End call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            ) : (
              <Button
                disabled={!isConfigured || !!configError || !hasPermissions || isCheckingPermissions}
                className="bg-[#333537] text-white px-6 py-2 rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed ml-2"
              >
                {isCheckingPermissions ? "Checking permissions..." : isStarting ? "Starting..." : isEnding ? "Ending..." : "Connecting..."}
              </Button>
            )}
          </div>

          {/* Right - Empty for now (matches screenshot) */}
          <div className="w-32" />
        </div>
      </div>

      {/* Meeting Info Banner */}
      {configError && (
        <div className="bg-red-600 text-white px-4 py-2 text-center">
          <div className="flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{configError}</span>
          </div>
        </div>
      )}

      {audioError && (
    <div className="fixed top-0 left-0 w-full z-50 bg-yellow-500 text-white px-4 py-2 text-center font-semibold">
      {audioError} {reconnectingAudio && <span>Reconnecting...</span>}
    </div>
  )}
    </div>
  )
}
