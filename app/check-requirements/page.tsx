"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  Mic,
  Wifi,
  Monitor,
  Smartphone,
  Globe,
  Download,
  Settings,
  ArrowLeft,
  RefreshCw,
  Info,
  Shield,
  Zap,
  Clock,
  Users,
  Video,
  Headphones,
  HardDrive,
  Cpu,
  Memory,
} from "lucide-react"

export default function CheckRequirementsPage() {
  const [requirements, setRequirements] = useState({
    camera: { available: false, testing: false, tested: false },
    microphone: { available: false, testing: false, tested: false },
    internet: { available: false, speed: 0, tested: false },
    browser: { compatible: false, name: '', version: '', tested: false },
    screen: { available: false, testing: false, tested: false },
    permissions: { camera: false, microphone: false, tested: false }
  })
  const [overallStatus, setOverallStatus] = useState<'checking' | 'ready' | 'issues'>('checking')
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkRequirements()
  }, [])

  const checkRequirements = async () => {
    setIsChecking(true)
    
    // Check browser compatibility
    const browserInfo = getBrowserInfo()
    const isCompatible = browserInfo.compatible
    
    // Check device capabilities
    const hasCamera = 'mediaDevices' in navigator
    const hasMicrophone = 'mediaDevices' in navigator
    const hasScreenShare = 'getDisplayMedia' in navigator
    
    // Check internet speed (simplified)
    const internetSpeed = await checkInternetSpeed()
    
    // Check permissions
    const permissions = await checkPermissions()
    
    const newRequirements = {
      camera: { available: hasCamera, testing: false, tested: true },
      microphone: { available: hasMicrophone, testing: false, tested: true },
      internet: { available: internetSpeed > 1, speed: internetSpeed, tested: true },
      browser: { compatible: isCompatible, name: browserInfo.name, version: browserInfo.version, tested: true },
      screen: { available: hasScreenShare, testing: false, tested: true },
      permissions: { camera: permissions.camera, microphone: permissions.microphone, tested: true }
    }
    
    setRequirements(newRequirements)
    
    // Determine overall status
    const allReady = Object.values(newRequirements).every(req => 
      req.tested && (req.available || req.compatible || req.speed > 1)
    )
    
    setOverallStatus(allReady ? 'ready' : 'issues')
    setIsChecking(false)
  }

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent
    let name = 'Unknown'
    let version = 'Unknown'
    let compatible = false
    
    if (userAgent.includes('Chrome')) {
      name = 'Chrome'
      version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
      compatible = parseInt(version) >= 80
    } else if (userAgent.includes('Firefox')) {
      name = 'Firefox'
      version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
      compatible = parseInt(version) >= 75
    } else if (userAgent.includes('Safari')) {
      name = 'Safari'
      version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown'
      compatible = parseInt(version) >= 13
    } else if (userAgent.includes('Edge')) {
      name = 'Edge'
      version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown'
      compatible = parseInt(version) >= 80
    }
    
    return { name, version, compatible }
  }

  const checkInternetSpeed = async (): Promise<number> => {
    // Simplified speed test - in real implementation, you'd use a proper speed test service
    const startTime = Date.now()
    try {
      await fetch('/api/ping', { method: 'HEAD' })
      const endTime = Date.now()
      const duration = endTime - startTime
      // Rough estimation: faster response = better connection
      return Math.max(1, 10 - (duration / 100))
    } catch {
      return 1 // Default fallback
    }
  }

  const checkPermissions = async () => {
    let camera = false
    let microphone = false
    
    try {
      if ('permissions' in navigator) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName })
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        camera = cameraPermission.state === 'granted'
        microphone = micPermission.state === 'granted'
      }
    } catch (error) {
      console.log('Permission check not supported')
    }
    
    return { camera, microphone }
  }

  const testCamera = async () => {
    setRequirements(prev => ({
      ...prev,
      camera: { ...prev.camera, testing: true }
    }))
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      
      setRequirements(prev => ({
        ...prev,
        camera: { available: true, testing: false, tested: true }
      }))
    } catch (error) {
      setRequirements(prev => ({
        ...prev,
        camera: { available: false, testing: false, tested: true }
      }))
    }
  }

  const testMicrophone = async () => {
    setRequirements(prev => ({
      ...prev,
      microphone: { ...prev.microphone, testing: true }
    }))
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      
      setRequirements(prev => ({
        ...prev,
        microphone: { available: true, testing: false, tested: true }
      }))
    } catch (error) {
      setRequirements(prev => ({
        ...prev,
        microphone: { available: false, testing: false, tested: true }
      }))
    }
  }

  const testScreenShare = async () => {
    setRequirements(prev => ({
      ...prev,
      screen: { ...prev.screen, testing: true }
    }))
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      
      setRequirements(prev => ({
        ...prev,
        screen: { available: true, testing: false, tested: true }
      }))
    } catch (error) {
      setRequirements(prev => ({
        ...prev,
        screen: { available: false, testing: false, tested: true }
      }))
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    )
  }

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Ready</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-red-200">Issue</Badge>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* Header */}
      <div className="bg-white border-b border-[#ececec]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-[#888] hover:text-[#222]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-medium text-[#222]">System Requirements Check</h1>
              <p className="text-[#888]">Verify your device meets all requirements for AI interviews</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Overall Status */}
        <div className="mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#ececec]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium text-[#222]">Overall Status</h2>
              <Button
                onClick={checkRequirements}
                disabled={isChecking}
                className="text-white"
                style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Recheck'}
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              {overallStatus === 'ready' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : overallStatus === 'issues' ? (
                <AlertCircle className="w-8 h-8 text-red-600" />
              ) : (
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              )}
              
              <div>
                <h3 className="text-lg font-medium text-[#222]">
                  {overallStatus === 'ready' ? 'All Requirements Met!' : 
                   overallStatus === 'issues' ? 'Some Issues Found' : 
                   'Checking Requirements...'}
                </h3>
                <p className="text-[#888]">
                  {overallStatus === 'ready' ? 'Your device is ready for AI interviews' :
                   overallStatus === 'issues' ? 'Please resolve the issues below before starting' :
                   'Verifying your system capabilities...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Camera */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#ececec]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}>
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-[#222]">Camera</h3>
                  <p className="text-sm text-[#888]">Webcam access required</p>
                </div>
              </div>
              {requirements.camera.tested && getStatusIcon(requirements.camera.available)}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888]">Status</span>
                {requirements.camera.tested && getStatusBadge(requirements.camera.available)}
              </div>
              
              {!requirements.camera.available && requirements.camera.tested && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">
                    Camera not detected or access denied. Please check your camera connection and permissions.
                  </p>
                </div>
              )}
              
              <Button
                onClick={testCamera}
                disabled={requirements.camera.testing}
                variant="outline"
                className="w-full border-[#ececec] text-[#222] hover:bg-[#f6f6f6]"
              >
                {requirements.camera.testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Test Camera
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Microphone */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#ececec]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}>
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-[#222]">Microphone</h3>
                  <p className="text-sm text-[#888]">Audio input required</p>
                </div>
              </div>
              {requirements.microphone.tested && getStatusIcon(requirements.microphone.available)}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888]">Status</span>
                {requirements.microphone.tested && getStatusBadge(requirements.microphone.available)}
              </div>
              
              {!requirements.microphone.available && requirements.microphone.tested && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">
                    Microphone not detected or access denied. Please check your microphone connection and permissions.
                  </p>
                </div>
              )}
              
              <Button
                onClick={testMicrophone}
                disabled={requirements.microphone.testing}
                variant="outline"
                className="w-full border-[#ececec] text-[#222] hover:bg-[#f6f6f6]"
              >
                {requirements.microphone.testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Headphones className="w-4 h-4 mr-2" />
                    Test Microphone
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Internet Connection */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#ececec]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}>
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-[#222]">Internet Connection</h3>
                  <p className="text-sm text-[#888]">Stable connection required</p>
                </div>
              </div>
              {requirements.internet.tested && getStatusIcon(requirements.internet.available)}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888]">Status</span>
                {requirements.internet.tested && getStatusBadge(requirements.internet.available)}
              </div>
              
              {requirements.internet.tested && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#888]">Speed</span>
                  <span className="text-sm font-medium text-[#222]">
                    {requirements.internet.speed.toFixed(1)} Mbps
                  </span>
                </div>
              )}
              
              {!requirements.internet.available && requirements.internet.tested && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">
                    Internet connection is too slow. Please use a faster connection for optimal experience.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Browser Compatibility */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#ececec]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}>
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-[#222]">Browser</h3>
                  <p className="text-sm text-[#888]">Modern browser required</p>
                </div>
              </div>
              {requirements.browser.tested && getStatusIcon(requirements.browser.compatible)}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888]">Status</span>
                {requirements.browser.tested && getStatusBadge(requirements.browser.compatible)}
              </div>
              
              {requirements.browser.tested && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#888]">Browser</span>
                    <span className="text-sm font-medium text-[#222]">{requirements.browser.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#888]">Version</span>
                    <span className="text-sm font-medium text-[#222]">{requirements.browser.version}</span>
                  </div>
                </>
              )}
              
              {!requirements.browser.compatible && requirements.browser.tested && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">
                    Browser version is outdated. Please update to the latest version for best compatibility.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Screen Sharing */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#ececec]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}>
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-[#222]">Screen Sharing</h3>
                  <p className="text-sm text-[#888]">Display sharing capability</p>
                </div>
              </div>
              {requirements.screen.tested && getStatusIcon(requirements.screen.available)}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888]">Status</span>
                {requirements.screen.tested && getStatusBadge(requirements.screen.available)}
              </div>
              
              {!requirements.screen.available && requirements.screen.tested && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">
                    Screen sharing not supported. This feature is required for interview monitoring.
                  </p>
                </div>
              )}
              
              <Button
                onClick={testScreenShare}
                disabled={requirements.screen.testing}
                variant="outline"
                className="w-full border-[#ececec] text-[#222] hover:bg-[#f6f6f6]"
              >
                {requirements.screen.testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Monitor className="w-4 h-4 mr-2" />
                    Test Screen Share
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Permissions */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#ececec]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-[#222]">Permissions</h3>
                  <p className="text-sm text-[#888]">Camera & microphone access</p>
                </div>
              </div>
              {requirements.permissions.tested && getStatusIcon(requirements.permissions.camera && requirements.permissions.microphone)}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888]">Camera</span>
                {requirements.permissions.tested && getStatusIcon(requirements.permissions.camera)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888]">Microphone</span>
                {requirements.permissions.tested && getStatusIcon(requirements.permissions.microphone)}
              </div>
              
              {requirements.permissions.tested && (!requirements.permissions.camera || !requirements.permissions.microphone) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    Some permissions are not granted. You may need to allow camera and microphone access in your browser settings.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#ececec]">
            <h3 className="text-lg font-medium text-[#222] mb-4">Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#222] mb-1">Internet Speed</h4>
                    <p className="text-sm text-[#888]">Minimum 2 Mbps upload and download speed recommended for smooth video calls.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#222] mb-1">Browser Settings</h4>
                    <p className="text-sm text-[#888]">Enable camera and microphone permissions in your browser settings.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#222] mb-1">Test Before Interview</h4>
                    <p className="text-sm text-[#888]">Run this check 15 minutes before your scheduled interview.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#222] mb-1">Quiet Environment</h4>
                    <p className="text-sm text-[#888]">Ensure you're in a quiet, well-lit environment for the best experience.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push('/dashboard')}
            className="flex-1 text-white"
            style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}
          >
            Back to Dashboard
          </Button>
          
          {overallStatus === 'ready' && (
            <Button
              onClick={() => router.push('/dashboard?tab=interviews')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Start Interview
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 