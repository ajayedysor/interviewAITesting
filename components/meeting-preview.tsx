"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Mic, MicOff, Video, VideoOff, MoreVertical, ChevronDown, User, Volume2, AlertCircle, AlertTriangle, Wifi, WifiOff, CheckCircle, XCircle, Shield, Clock, Camera, FileText, Globe } from "lucide-react"
import { InterviewRoom } from "./interview-room";
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { EndMeeting } from "./end-meeting";
import React from "react";

// Filled alert icon for camera error
function FilledAlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#facc15" className="w-4 h-4 absolute -top-1 -right-1" aria-label="Camera not found">
      <circle cx="12" cy="12" r="12" />
      <text x="12" y="17" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#000">!</text>
    </svg>
  )
}

interface University {
  id: string;
  name: string;
  logo_url: string | null;
  questions: string | null;
  file_id: string | null;
  student_count: number | null;
  interview_count: number | null;
  created_at: string | null;
  interviewer_id: string | null;
  question_bank: string | null;
}

interface Interviewer {
  id: string;
  name: string;
  assistantID: string;
  vendorName: string;
  avatarUrl: string | null;
  videoUrl: string | null;
  voice_provider: string | null;
  voice_id: string | null;
  gender: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  userSummary?: string;
  docs?: any;
  createdAt?: string;
  updatedAt?: string;
}

export function SpeechIndicator({ isMuted, volumeLevel }: { isMuted?: boolean; volumeLevel?: number }) {
  // If props are not provided, fallback to local state (for MeetingPreview usage)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (typeof isMuted === 'boolean' && typeof volumeLevel === 'number') {
      setIsSpeaking(!isMuted && volumeLevel > 0.1);
      setLevel(volumeLevel);
    }
  }, [isMuted, volumeLevel]);
  const baseHeight = 2;
  const maxHeight = 12;
  const bar1Height = isSpeaking ? Math.max(baseHeight, level * maxHeight) : baseHeight;
  const bar2Height = isSpeaking ? Math.max(baseHeight + 2, level * (maxHeight + 4)) : baseHeight + 2;
  const bar3Height = isSpeaking ? Math.max(baseHeight, level * maxHeight) : baseHeight;
  return (
    <div className="flex items-center justify-center space-x-0.5 h-4">
      <div className="w-1 bg-white rounded-full transition-all duration-100" style={{ height: `${bar1Height}px` }} />
      <div className="w-1 bg-white rounded-full transition-all duration-100" style={{ height: `${bar2Height}px` }} />
      <div className="w-1 bg-white rounded-full transition-all duration-100" style={{ height: `${bar3Height}px` }} />
    </div>
  );
}

export function MeetingPreview({ meetingId, university, interviewer, user, interview }: { meetingId: string; university?: University | null; interviewer?: Interviewer | null; user?: User | null; interview?: any | null }) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>({} as AnalyserNode)
  const animationFrameRef = useRef<number | null>(null)

  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>("")
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>("")
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>("")
  const [hasPermissions, setHasPermissions] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [step, setStep] = useState<'preview' | 'meeting' | 'end'>('preview');
  const [networkQuality, setNetworkQuality] = useState<{ label: string; color: string; icon: React.JSX.Element; effectiveType?: string }>({ label: 'Unknown', color: 'bg-gray-400', icon: <></>, effectiveType: undefined });
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [showDoDont, setShowDoDont] = useState(false);
  const [doDontAgreed, setDoDontAgreed] = useState(false);
  const audioDetectionSetupRef = useRef(false);
  const [multipleScreens, setMultipleScreens] = useState(false);
  const [screenPermissionChecked, setScreenPermissionChecked] = useState(false);
  const [screenPermissionDenied, setScreenPermissionDenied] = useState(false);
  const [checkingScreens, setCheckingScreens] = useState(false);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const [isCheckingMicrophone, setIsCheckingMicrophone] = useState(false);


  // Audio detection setup
  const setupAudioDetection = (stream: MediaStream) => {
    try {
      // Clean up any existing audio context
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()

      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.8
      source.connect(analyserRef.current)

      let isDetecting = true

      const detectAudio = () => {
        if (!analyserRef.current || !isDetecting) return

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        const normalizedLevel = Math.min(average / 50, 1)

        // Use functional updates to prevent stale closures
        setAudioLevel(prev => {
          // Only update if the change is significant to prevent unnecessary re-renders
          return Math.abs(prev - normalizedLevel) > 0.01 ? normalizedLevel : prev;
        });
        
        setIsSpeaking(prev => {
          const newIsSpeaking = average > 10;
          return prev !== newIsSpeaking ? newIsSpeaking : prev;
        });

        if (isDetecting) {
          animationFrameRef.current = requestAnimationFrame(detectAudio)
        }
      }

      detectAudio()

      // Return cleanup function
      return () => {
        isDetecting = false
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    } catch (error) {
      console.error("Error setting up audio detection:", error)
      return () => {}
    }
  }

  useEffect(() => {
    let audioDetectionCleanup: (() => void) | undefined

    const initializeDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        setVideoStream(stream)
        setHasPermissions(true)
        
        // Only setup audio detection once
        if (!audioDetectionSetupRef.current) {
          audioDetectionCleanup = setupAudioDetection(stream)
          audioDetectionSetupRef.current = true
        }

        const devices = await navigator.mediaDevices.enumerateDevices()

        const audioInputs = devices.filter((device) => device.kind === "audioinput")
        const audioOutputs = devices.filter((device) => device.kind === "audiooutput")
        const videoInputs = devices.filter((device) => device.kind === "videoinput")

        setAudioDevices([...audioInputs, ...audioOutputs])
        setVideoDevices(videoInputs)

        if (audioInputs.length > 0) setSelectedAudioInput(audioInputs[0].deviceId)
        if (audioOutputs.length > 0) setSelectedAudioOutput(audioOutputs[0].deviceId)
        if (videoInputs.length > 0) setSelectedVideoInput(videoInputs[0].deviceId)

        if (videoRef.current && isVideoOn) {
          videoRef.current.srcObject = stream
        }

        // Automatically request window-management permission after camera/mic permission
        if (!screenPermissionChecked && !screenPermissionDenied) {
          handleRequestPermission();
        }
      } catch (error: any) {
        console.error("Error accessing media devices:", error)
        setHasPermissions(false)
        if (
          error?.name === 'NotAllowedError' ||
          error?.name === 'PermissionDeniedError' ||
          (typeof error === 'string' && error.toLowerCase().includes('permission')) ||
          (error?.message && error.message.toLowerCase().includes('permission'))
        ) {
          setPermissionBlocked(true);
        }
        if (error && error.message && error.message.includes("Requested device not found")) {
          setCameraError("Requested device not found")
        }
      }
    }

    initializeDevices()

    return () => {
      if (audioDetectionCleanup) {
        audioDetectionCleanup()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop())
      }
      audioDetectionSetupRef.current = false
    }
  }, [])

  // Add a handler for checking screens
  const handleCheckScreens = async () => {
    if ('getScreenDetails' in window) {
      try {
        // @ts-ignore
        const details = await window.getScreenDetails();
        setMultipleScreens(details.screens.length > 1);
        setScreenPermissionChecked(true);
        setScreenPermissionDenied(false);
        details.addEventListener('screenschange', () => {
          setMultipleScreens(details.screens.length > 1);
        });
      } catch (e) {
        setScreenPermissionChecked(false);
        setScreenPermissionDenied(true);
      }
    } else {
      setScreenPermissionChecked(false);
      setScreenPermissionDenied(true);
    }
  };

  const checkScreens = async () => {
    setCheckingScreens(true);
    if ('getScreenDetails' in window) {
      try {
        // @ts-ignore
        const details = await window.getScreenDetails();
        setMultipleScreens(details.screens.length > 1);
        setScreenPermissionChecked(true);
        setScreenPermissionDenied(false);
        details.addEventListener('screenschange', () => {
          setMultipleScreens(details.screens.length > 1);
        });
      } catch (e) {
        setScreenPermissionChecked(false);
        setScreenPermissionDenied(true);
      }
    } else {
      setScreenPermissionChecked(false);
      setScreenPermissionDenied(true);
    }
    setCheckingScreens(false);
  };

  useEffect(() => {
    checkScreens();
  }, []);

  const handleRequestPermission = async () => {
    if (navigator.permissions && (navigator.permissions as any).request) {
      try {
        // @ts-ignore
        await (navigator.permissions as any).request({ name: 'window-management' });
        await checkScreens();
      } catch (e) {
        // ignore
      }
    } else {
      // Not supported, just re-check
      await checkScreens();
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;
    if (isVideoOn) {
      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: selectedVideoInput ? { deviceId: { exact: selectedVideoInput } } : true,
            audio: { deviceId: selectedAudioInput ? { exact: selectedAudioInput } : undefined },
          });
          setVideoStream(stream);
          videoRef.current!.srcObject = stream;
          // Always set up audio detection on the new stream
          setupAudioDetection(stream);
        } catch (err) {
          // fallback: do nothing
        }
      })();
    } else {
      if (videoStream) {
        videoStream.getVideoTracks().forEach((track) => track.stop());
      }
      // Do NOT stop audio tracks or set videoStream to null, keep audio for visualizer
      if (videoRef.current) {
        // Create a new stream with only audio tracks
        const audioOnlyStream = videoStream ? new MediaStream(videoStream.getAudioTracks()) : null;
        videoRef.current.srcObject = audioOnlyStream;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVideoOn, selectedVideoInput, selectedAudioInput]);

  useEffect(() => {
    if (!selectedAudioInput) return;
    // Only switch if not initial mount
    if (!hasPermissions) return;
    
    let audioDetectionCleanup: (() => void) | undefined
    
    const switchAudioInput = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: selectedAudioInput } },
          video: isVideoOn ? { deviceId: selectedVideoInput ? { exact: selectedVideoInput } : undefined } : false,
        });
        // Replace audio tracks in videoStream
        if (videoStream) {
          videoStream.getAudioTracks().forEach((track) => track.stop());
          stream.getAudioTracks().forEach((track) => videoStream.addTrack(track));
        } else {
          setVideoStream(stream);
        }
        // Don't setup audio detection again for device switching
        // audioDetectionCleanup = setupAudioDetection(stream);
      } catch (err) {
        // fallback: do nothing
      }
    };
    switchAudioInput();
    
    return () => {
      if (audioDetectionCleanup) {
        audioDetectionCleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAudioInput]);

  useEffect(() => {
    if (!selectedVideoInput) return;
    if (!hasPermissions) return;
    const switchVideoInput = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedVideoInput } },
          audio: isMuted ? false : { deviceId: selectedAudioInput ? { exact: selectedAudioInput } : undefined },
        });
        // Replace video tracks in videoStream
        if (videoStream) {
          videoStream.getVideoTracks().forEach((track) => track.stop());
          stream.getVideoTracks().forEach((track) => videoStream.addTrack(track));
        } else {
          setVideoStream(stream);
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        // fallback: do nothing
      }
    };
    switchVideoInput();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideoInput]);

  useEffect(() => {
    if (!selectedAudioOutput) return;
    if (videoRef.current && typeof videoRef.current["setSinkId"] === "function") {
      // @ts-ignore
      videoRef.current.setSinkId(selectedAudioOutput).catch(() => {});
    }
  }, [selectedAudioOutput]);

  useEffect(() => {
    function updateNetworkQuality() {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        let label = 'Unknown';
        let color = 'bg-gray-400';
        let effectiveType = connection.effectiveType;
        if (connection.effectiveType) {
          switch (connection.effectiveType) {
            case '4g':
              label = 'Excellent';
              color = 'bg-green-500';
              break;
            case '3g':
              label = 'Good';
              color = 'bg-yellow-400';
              break;
            case '2g':
              label = 'Fair';
              color = 'bg-orange-400';
              break;
            case 'slow-2g':
              label = 'Poor';
              color = 'bg-red-500';
              break;
            default:
              break;
          }
        }
        setNetworkQuality({ label, color, icon: <></>, effectiveType });
      }
    }
    updateNetworkQuality();
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection && connection.addEventListener) {
      connection.addEventListener('change', updateNetworkQuality);
      return () => connection.removeEventListener('change', updateNetworkQuality);
    }
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (videoStream) {
      videoStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted
      })
    }
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
  }

  // Helper to re-request permissions if denied
  const reRequestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setVideoStream(stream);
      setHasPermissions(true);
      setPermissionBlocked(false);
      setCameraError(null);
      // Optionally, re-enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter((device) => device.kind === "audioinput");
      const audioOutputs = devices.filter((device) => device.kind === "audiooutput");
      const videoInputs = devices.filter((device) => device.kind === "videoinput");
      setAudioDevices([...audioInputs, ...audioOutputs]);
      setVideoDevices(videoInputs);
      if (audioInputs.length > 0) setSelectedAudioInput(audioInputs[0].deviceId);
      if (audioOutputs.length > 0) setSelectedAudioOutput(audioOutputs[0].deviceId);
      if (videoInputs.length > 0) setSelectedVideoInput(videoInputs[0].deviceId);
      if (videoRef.current && isVideoOn) {
        videoRef.current.srcObject = stream;
      }
    } catch (error: any) {
      // If still denied, keep state as is
      setHasPermissions(false);
      setPermissionBlocked(true);
      if (error && error.message && error.message.includes("Requested device not found")) {
        setCameraError("Requested device not found");
      }
    }
  };

  // Enhanced microphone health check function
  const checkMicrophoneHealth = async (): Promise<boolean> => {
    setIsCheckingMicrophone(true);
    setMicrophoneError(null);
    
    try {
      // Get current stream or request new one
      let stream = videoStream;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      }
      
      // Check if audio tracks exist
      const audioTracks = stream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) {
        setMicrophoneError("No microphone detected. Please connect a microphone and try again.");
        return false;
      }
      
      const audioTrack = audioTracks[0];
      
      // Check if audio track is in a healthy state
      if (audioTrack.readyState !== 'live') {
        setMicrophoneError("Microphone is not working properly. Please check your microphone and try again.");
        return false;
      }
      
      if (!audioTrack.enabled) {
        setMicrophoneError("Microphone is disabled. Please enable your microphone and try again.");
        return false;
      }
      
      // Check microphone settings
      try {
        const settings = audioTrack.getSettings();
        if (!settings.deviceId) {
          setMicrophoneError("Microphone not properly configured. Please check your microphone settings.");
          return false;
        }
      } catch (settingsError) {
        setMicrophoneError("Microphone configuration error. Please check your microphone and try again.");
        return false;
      }
      
      // If we reach here, microphone is healthy
      setMicrophoneError(null);
      return true;
      
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        setMicrophoneError("Microphone access denied. Please allow microphone permissions.");
      } else if (error.name === "NotFoundError") {
        setMicrophoneError("No microphone found. Please connect a microphone.");
      } else if (error.name === "NotReadableError") {
        setMicrophoneError("Microphone is already in use by another application.");
      } else {
        setMicrophoneError("Microphone error. Please check your microphone and try again.");
      }
      return false;
    } finally {
      setIsCheckingMicrophone(false);
    }
  };

  // Replace joinMeeting to advance step
  const joinMeeting = async () => {
    if (networkQuality.effectiveType === 'slow-2g') {
      setShowNetworkError(true);
      return;
    }
    
    // Check microphone health before allowing join
    const isMicrophoneHealthy = await checkMicrophoneHealth();
    if (!isMicrophoneHealthy) {
      return; // Don't proceed if microphone has issues
    }
    
    setShowDoDont(true);
  };

  const handleCloseDoDont = () => {
    setShowDoDont(false);
  };

  const handleAgreeAndStart = () => {
    if (step !== 'end') {
      setShowDoDont(false);
      setStep('meeting');
    }
  };

  // Add endMeeting to advance to end step
  const endMeeting = () => {
    setStep('end');
  };

  const getDeviceLabel = (deviceId: string, devices: MediaDeviceInfo[]) => {
    const device = devices.find((d) => d.deviceId === deviceId)
    return device?.label || "Default"
  }

  // Render based on step
  if (step === 'preview') {
    return (
      <div className="min-h-screen bg-white">
        {/* Alert for blocked permissions */}
        {permissionBlocked && (
          <div className="w-full bg-red-100 text-red-700 px-4 py-3 text-center font-semibold">
            Camera or microphone permission is <b>blocked</b>. Please allow access in your browser settings and refresh the page.
          </div>
        )}
        {/* Alert for window-management permission blocked */}
        {screenPermissionDenied && (
          <div className="w-full bg-red-100 text-red-700 px-4 py-3 text-center font-semibold flex items-center justify-center gap-4">
            <span>
              Unable to check for multiple screens. Please allow <span className="font-bold">'window-management'</span> permission in your browser settings.
            </span>
            <button
              className="px-3 py-1 border border-red-500 text-red-700 bg-transparent rounded text-xs font-semibold transition-colors duration-200 ml-2 hover:bg-red-50 hover:border-red-600 hover:text-red-800"
              onClick={handleRequestPermission}
              disabled={checkingScreens}
            >
              Grant 'window-management' permission
            </button>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {university?.logo_url ? (
                <img 
                  src={university.logo_url} 
                  alt={`${university.name} logo`}
                  className="w-8 h-8 rounded object-contain"
                />
              ) : (
                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                  <Video className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-xl font-normal text-gray-700">
                {university?.name || "University Interview"}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.name || "muskan@muskan.ai"}</span>
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.name ? user.name.charAt(0).toUpperCase() : "E"}
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-8">
          <div className="flex items-center space-x-16 max-w-6xl w-full">
            {/* Video Preview */}
            <div className="flex-1 max-w-2xl">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-lg">
                {/* Video Stream */}
                {isVideoOn && hasPermissions && !cameraError ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover transform -scale-x-100 z-0"
                    />
                    {/* Vignette overlay (decreased effect, correct stacking) */}
                    <div className="pointer-events-none absolute inset-0 z-10" style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.18) 100%)'}} />
                  </>
                ) : !hasPermissions ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin h-8 w-8 text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      <p className="text-white text-lg">Waiting for camera/mic permissions...</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <VideoOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        {cameraError === "Requested device not found" && <FilledAlertIcon />}
                      </div>
                      <p className="text-white text-lg">
                        {cameraError === "Requested device not found" ? "Camera not found" : "Camera is off"}
                      </p>
                    </div>
                  </div>
                )}
                {/* User Name Overlay */}
                <div className="absolute top-4 left-4 text-white text-sm font-medium z-20">
                  {user?.name || "Muskan.ai Assistant"}
                </div>
                {/* More Options */}
                <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
                  {/* Network Quality Indicator */}
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${networkQuality.color}`} style={{opacity: 0.8}} title={`Network: ${networkQuality.label}`}>
                    {(() => {
                      // Always render the icon as white
                      switch (networkQuality.label) {
                        case 'Excellent':
                        case 'Good':
                        case 'Fair':
                          return <Wifi className="w-4 h-4 text-white" />;
                        case 'Poor':
                        case 'Unknown':
                        default:
                          return <WifiOff className="w-4 h-4 text-white" />;
                      }
                    })()}
                    <span className="ml-1 text-white drop-shadow">{networkQuality.label}</span>
                  </div>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-200">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                {/* Control Buttons - Exact Google Meet styling */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-20">
                  {/* Microphone */}
                  <button
                    onClick={() => {
                      if (!hasPermissions || permissionBlocked) {
                        reRequestPermissions();
                      } else {
                        toggleMute();
                      }
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isMuted || !audioDevices.some(d => d.kind === 'audioinput')
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-transparent border-2 border-white hover:bg-white/10 backdrop-blur-sm"
                    }`}
                    disabled={!audioDevices.some(d => d.kind === 'audioinput')}
                    aria-label={!audioDevices.some(d => d.kind === 'audioinput') ? "Microphone not found" : (isMuted ? "Unmute" : "Mute")}
                    title={!audioDevices.some(d => d.kind === 'audioinput') ? "Microphone not found" : (isMuted ? "Unmute" : "Mute")}
                  >
                    {(!audioDevices.some(d => d.kind === 'audioinput')) ? (
                      <span className="relative inline-block">
                        <MicOff className="w-6 h-6 text-white" />
                        <FilledAlertIcon />
                      </span>
                    ) : isMuted ? (
                      <MicOff className="w-6 h-6 text-white" />
                    ) : (
                      <Mic className="w-6 h-6 text-white" />
                    )}
                  </button>
                  {/* Camera */}
                  <button
                    onClick={() => {
                      if (!hasPermissions || permissionBlocked) {
                        reRequestPermissions();
                      } else {
                        toggleVideo();
                      }
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                      !isVideoOn || cameraError === "Requested device not found" || !hasPermissions || videoDevices.length === 0
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-transparent border-2 border-white hover:bg-white/10 backdrop-blur-sm"
                    }`}
                    disabled={cameraError === "Requested device not found" || !hasPermissions || videoDevices.length === 0}
                    aria-label={
                      cameraError === "Requested device not found" || !hasPermissions || videoDevices.length === 0
                        ? "Camera not found"
                        : isVideoOn
                        ? "Turn off camera"
                        : "Turn on camera"
                    }
                    title={
                      cameraError === "Requested device not found" || !hasPermissions || videoDevices.length === 0
                        ? "Camera not found"
                        : isVideoOn
                        ? "Turn off camera"
                        : "Turn on camera"
                    }
                  >
                    {cameraError === "Requested device not found" || !hasPermissions || videoDevices.length === 0 ? (
                      <span className="relative inline-block">
                        <VideoOff className="w-6 h-6 text-white" />
                        <FilledAlertIcon />
                      </span>
                    ) : isVideoOn ? (
                      <Video className="w-6 h-6 text-white" />
                    ) : (
                      <VideoOff className="w-6 h-6 text-white" />
                    )}
                  </button>
                </div>
                {/* Effects Button */}
                <div className="absolute bottom-6 right-6"></div>
                {/* Speech Indicator */}
                <div className="absolute bottom-4 left-4 bg-blue-600 rounded-full flex items-center justify-center h-[30px] w-[30px] z-20">
                  <SpeechIndicator isMuted={isMuted} volumeLevel={audioLevel} />
                </div>
              </div>
              {/* Device Selectors - Reduced spacing */}
              <div className="flex items-center justify-center space-x-6 mt-3 px-1">
                {/* Audio Input */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors duration-200">
                      <Mic className="w-4 h-4" />
                      <span className="text-sm">
                        {audioDevices.length > 0
                          ? getDeviceLabel(selectedAudioInput, audioDevices).substring(0, 12) + "..."
                          : "No device"}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {audioDevices
                      .filter((d) => d.kind === "audioinput")
                      .map((device) => (
                        <DropdownMenuItem key={device.deviceId} onClick={() => setSelectedAudioInput(device.deviceId)}>
                          {device.label || `Microphone ${device.deviceId.substring(0, 5)}`}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Audio Output */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors duration-200">
                      <Volume2 className="w-4 h-4" />
                      <span className="text-sm">
                        {audioDevices.length > 0
                          ? getDeviceLabel(selectedAudioOutput, audioDevices).substring(0, 12) + "..."
                          : "No device"}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {audioDevices
                      .filter((d) => d.kind === "audiooutput")
                      .map((device) => (
                        <DropdownMenuItem key={device.deviceId} onClick={() => setSelectedAudioOutput(device.deviceId)}>
                          {device.label || `Speaker ${device.deviceId.substring(0, 5)}`}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Video Input */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors duration-200">
                      <Video className="w-4 h-4" />
                      <span className="text-sm">
                        {videoDevices.length > 0
                          ? getDeviceLabel(selectedVideoInput, videoDevices).substring(0, 12) + "..."
                          : "No device"}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {videoDevices.map((device) => (
                      <DropdownMenuItem key={device.deviceId} onClick={() => setSelectedVideoInput(device.deviceId)}>
                        {device.label || `Camera ${device.deviceId.substring(0, 5)}`}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {/* Join Section */}
            <div className="flex-shrink-0 w-80">
              <div className="text-center">
                <h2 className="text-2xl font-normal text-gray-800 mb-6">Ready to join?</h2>
                <div className="flex flex-col items-center mb-8">
                  {interviewer?.avatarUrl ? (
                    <img 
                      src={interviewer.avatarUrl} 
                      alt={`${interviewer.name} avatar`}
                      className="w-10 h-10 rounded-full object-cover mb-3"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium mb-3">
                      {interviewer?.name ? interviewer.name.charAt(0).toUpperCase() : "E"}
                    </div>
                  )}
                  <p className="text-gray-600">
                    {interviewer?.name || "Muskan.ai Assistant"} is in this call
                  </p>
                </div>
                {screenPermissionChecked && multipleScreens && (
                  <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center text-sm font-medium">
                    Multiple screens detected. Disconnect all but one screen to join the interview.<br/>
                    If you connect another screen during the interview, the session will end immediately.
                  </div>
                )}
                {microphoneError && (
                  <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center text-sm font-medium">
                    {microphoneError}
                  </div>
                )}
                <Button
                  onClick={joinMeeting}
                  className="w-64 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-full text-base font-medium mb-4 transition-colors duration-200"
                  disabled={
                    !screenPermissionChecked ||
                    multipleScreens ||
                    !(hasPermissions && audioDevices.some(d => d.kind === 'audioinput') && videoDevices.length > 0) ||
                    isMuted ||
                    !isVideoOn ||
                    !!microphoneError ||
                    isCheckingMicrophone
                  }
                >
                  {isCheckingMicrophone ? "Checking microphone..." : "Join now"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-64 border-gray-300 text-gray-400 py-2.5 px-6 rounded-full text-base font-medium bg-transparent cursor-not-allowed transition-colors duration-200"
                      disabled={true}
                    >
                      Other ways to join
                      <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem disabled>Join by phone</DropdownMenuItem>
                    <DropdownMenuItem disabled>Join from a room system</DropdownMenuItem>
                    <DropdownMenuItem disabled>Join another way</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        {/* Network Quality Error Popup */}
        {showNetworkError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full text-center">
              <div className="mb-4">
                <WifiOff className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Network Issue</h3>
                <p className="text-gray-700">Your network quality does not meet the requirements. Please use a stable network connection.</p>
              </div>
              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => setShowNetworkError(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {/* Do/Don't Modal */}
        {showDoDont && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
                onClick={handleCloseDoDont}
                aria-label="Close"
              >
                ×
              </button>
              {/* Things To Do Section */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Things To Do</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Be honest while giving your answers.</span>
                  </div>
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Speak clearly and keep your answers short and to the point.</span>
                  </div>
                  <div className="flex items-start">
                    <Camera className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Look at the camera and answer confidently.</span>
                  </div>
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Stay positive and try to give correct and thoughtful answers.</span>
                  </div>
                </div>
              </div>
              {/* Things Not To Do Section */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <XCircle className="w-6 h-6 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Things Not To Do</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="relative mr-3 mt-0.5 flex-shrink-0">
                      <Camera className="w-5 h-5 text-red-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-0.5 bg-red-500 transform rotate-45"></div>
                      </div>
                    </div>
                    <span className="text-gray-700">Do not look around or try to cheat.</span>
                  </div>
                  <div className="flex items-start">
                    <div className="relative mr-3 mt-0.5 flex-shrink-0">
                      <FileText className="w-5 h-5 text-red-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-0.5 bg-red-500 transform rotate-45"></div>
                      </div>
                    </div>
                    <span className="text-gray-700">Do not read or use any notes or study material.</span>
                  </div>
                  <div className="flex items-start">
                    <div className="relative mr-3 mt-0.5 flex-shrink-0">
                      <Clock className="w-5 h-5 text-red-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-0.5 bg-red-500 transform rotate-45"></div>
                      </div>
                    </div>
                    <span className="text-gray-700">Do not close the window unless told to do so.</span>
                  </div>
                  <div className="flex items-start">
                    <div className="relative mr-3 mt-0.5 flex-shrink-0">
                      <Globe className="w-5 h-5 text-red-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-0.5 bg-red-500 transform rotate-45"></div>
                      </div>
                    </div>
                    <span className="text-gray-700">Do not open other websites. The system will track your activity.</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center mb-6">
                <input
                  id="do-dont-agree"
                  type="checkbox"
                  checked={doDontAgreed}
                  onChange={e => setDoDontAgreed(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="do-dont-agree" className="ml-3 text-gray-700 text-base select-none">
                  I have read and agree to the instructions above.
                </label>
              </div>
              <button
                className={`w-full py-3 rounded-full text-base font-semibold transition-colors duration-200 ${doDontAgreed ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!doDontAgreed}
                onClick={handleAgreeAndStart}
              >
                Start call
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }
  if (step === 'meeting') {
    // Render InterviewRoom, pass endMeeting callback and interviewer (only if defined)
    return <InterviewRoom 
      onEnd={endMeeting} 
      meetingId={meetingId} 
      interviewer={interviewer ?? undefined} 
      user={user ?? undefined}
      university={university ?? undefined}
      interview={interview ?? undefined}
    />;
  }
  if (step === 'end') {
    // Render EndMeeting for the end screen
    return <EndMeeting />;
  }
  return null;
}
