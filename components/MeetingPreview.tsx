"use client";

import { useState, useEffect, useRef } from "react";

interface MeetingPreviewProps {
  onStartInterview: () => void;
}

interface DeviceInfo {
  deviceId: string;
  label: string;
}

export default function MeetingPreview({ onStartInterview }: MeetingPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const [hasCamera, setHasCamera] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<DeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMic, setSelectedMic] = useState<string>("");

  // Get devices
  const getDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === "videoinput").map(d => ({
      deviceId: d.deviceId,
      label: d.label || `Camera ${d.deviceId.slice(0, 5)}`
    }));
    const audioDevices = devices.filter(d => d.kind === "audioinput").map(d => ({
      deviceId: d.deviceId,
      label: d.label || `Microphone ${d.deviceId.slice(0, 5)}`
    }));
    setCameras(videoDevices);
    setMicrophones(audioDevices);
    return { videoDevices, audioDevices };
  };

  // Start camera
  const startCamera = async (cameraId?: string, micId?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Request media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraId ? { deviceId: { exact: cameraId } } : true,
        audio: micId ? { deviceId: { exact: micId } } : true
      });

      streamRef.current = stream;

      // Attach to video element (tolerate AbortError from rapid reloads)
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr: any) {
          if (playErr?.name === "AbortError") {
            console.warn("Video play aborted (likely due to rapid reload), ignoring");
          } else {
            throw playErr;
          }
        }
      }

      // Check tracks
      setHasCamera(stream.getVideoTracks().length > 0);
      setHasMic(stream.getAudioTracks().length > 0);

      // Audio level monitoring
      if (stream.getAudioTracks().length > 0) {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        audioContextRef.current = audioContext;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (!mountedRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAudioLevel(avg / 255);
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      }

      // Refresh device labels
      await getDevices();

    } catch (err: any) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError") {
        setError("Permission denied. Please allow camera and microphone access.");
      } else if (err.name === "NotFoundError") {
        setError("No camera or microphone found.");
      } else {
        setError(err.message || "Failed to access camera.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    const init = async () => {
      const { videoDevices, audioDevices } = await getDevices();
      const camId = videoDevices[0]?.deviceId || "";
      const micId = audioDevices[0]?.deviceId || "";
      setSelectedCamera(camId);
      setSelectedMic(micId);
      await startCamera(camId, micId);
    };
    init();

    return () => {
      mountedRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle device changes
  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
    startCamera(deviceId, selectedMic);
  };

  const handleMicChange = (deviceId: string) => {
    setSelectedMic(deviceId);
    startCamera(selectedCamera, deviceId);
  };

  const isReady = hasCamera && hasMic && !error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Pre-Interview Check</h1>
          <p className="text-slate-500">Let's make sure your camera and microphone are working</p>
        </div>

        {/* Video Preview */}
        <div className="relative mb-6 rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="text-center">
                <svg className="w-10 h-10 mx-auto text-indigo-400 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-white text-sm">Starting camera...</p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95">
              <div className="text-center px-4">
                <svg className="w-12 h-12 mx-auto text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-white font-medium mb-2">{error}</p>
                <button
                  onClick={() => startCamera(selectedCamera, selectedMic)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Device Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Camera</label>
            <select
              value={selectedCamera}
              onChange={(e) => handleCameraChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {cameras.map(cam => (
                <option key={cam.deviceId} value={cam.deviceId}>{cam.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Microphone</label>
            <select
              value={selectedMic}
              onChange={(e) => handleMicChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {microphones.map(mic => (
                <option key={mic.deviceId} value={mic.deviceId}>{mic.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-xl border-2 ${hasCamera ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasCamera ? 'bg-emerald-500' : 'bg-red-500'}`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className={`font-medium ${hasCamera ? 'text-emerald-800' : 'text-red-800'}`}>Camera</p>
                <p className={`text-sm ${hasCamera ? 'text-emerald-600' : 'text-red-600'}`}>
                  {hasCamera ? 'Working' : 'Not detected'}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border-2 ${hasMic ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasMic ? 'bg-emerald-500' : 'bg-red-500'}`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className={`font-medium ${hasMic ? 'text-emerald-800' : 'text-red-800'}`}>Microphone</p>
                <p className={`text-sm ${hasMic ? 'text-emerald-600' : 'text-red-600'}`}>
                  {hasMic ? 'Working' : 'Not detected'}
                </p>
              </div>
            </div>
            {hasMic && (
              <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-75"
                  style={{ width: `${Math.min(audioLevel * 300, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Ready Status */}
        <div className={`text-center p-4 rounded-xl mb-6 ${isReady ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-center justify-center gap-2">
            {isReady ? (
              <>
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-emerald-800">Ready to start your interview!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium text-amber-800">Please check your camera and microphone</span>
              </>
            )}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartInterview}
          disabled={!isReady}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
            isReady
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg hover:shadow-xl'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start Interview
        </button>
      </div>
    </div>
  );
}
