"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { InterviewCard } from "@/components/interview-card"
import { toast, Toaster } from "sonner"


function SquareDotsLoader() {
  return (
    <span className="flex items-center justify-center gap-0.5 w-full">
      <span className="w-2 h-2 bg-black animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-2 h-2 bg-black animate-bounce [animation-delay:0s]"></span>
      <span className="w-2 h-2 bg-black animate-bounce [animation-delay:0.2s]"></span>
    </span>
  );
}
import {
  Upload,
  BookOpen,
  Award,
  Target,
  Calendar,
  MapPin,
  GraduationCap,
  FileText,
  Camera,
  Settings,
  Bell,
  Search,
  Plus,
  Home,
  User,
  BarChart3,
  Shield,
  HelpCircle,
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
  FileQuestion,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Globe,
  Download,
  Play,
  Users,
  Zap,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  XCircle,
  Mic,
  Wifi,
  Monitor,
  Video,
  Headphones,
  RefreshCw,
  AlertCircle,
} from "lucide-react"




export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [helpSelectedTab, setHelpSelectedTab] = useState("overview")
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [requirements, setRequirements] = useState({
    camera: { available: false, testing: false, tested: false },
    microphone: { available: false, testing: false, tested: false },
    internet: { available: false, speed: 0, tested: false },
    browser: { compatible: false, name: '', version: '', tested: false }
  })
  const [overallStatus, setOverallStatus] = useState<'checking' | 'ready' | 'issues'>('checking')
  const [isChecking, setIsChecking] = useState(false)
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [userPassportNumber, setUserPassportNumber] = useState<string | null>(null);
  const [userSummary, setUserSummary] = useState<string>("");
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
  const [isPassportDragOver, setIsPassportDragOver] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const router = useRouter();
  const [isShortScreen, setIsShortScreen] = useState(false);
  const [cameraPreview, setCameraPreview] = useState<MediaStream | null>(null);
  const [microphonePreview, setMicrophonePreview] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("sessionUser");
      const sessionUserId = localStorage.getItem("sessionUserId");
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserName(user.name || "");
          setUserEmail(user.email || "");
          setUserPassportNumber(user.passportNumber || null);
          // Reset verification status if user already has passport number
          if (user.passportNumber && user.passportNumber !== "VERIFIED") {
            setVerificationStatus('success');
          }
        } catch {
          setUserName("");
          setUserEmail("");
          setUserPassportNumber(null);
        }
      }
      
      if (sessionUserId) {
        setUserId(sessionUserId);
        fetchInterviews(sessionUserId);
        fetchUserData(sessionUserId);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedTab === "help") {
      checkRequirements();
    }
  }, [selectedTab]);

  // Cleanup media streams on unmount
  useEffect(() => {
    return () => {
      if (cameraPreview) {
        cameraPreview.getTracks().forEach(track => track.stop());
      }
      if (microphonePreview) {
        microphonePreview.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraPreview, microphonePreview]);

  useEffect(() => {
    function checkHeight() {
      setIsShortScreen(window.innerHeight < 750); // adjust threshold as needed
    }
    checkHeight();
    window.addEventListener("resize", checkHeight);
    return () => window.removeEventListener("resize", checkHeight);
  }, []);

  const fetchInterviews = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/interviews?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const interviewsData = data.interviews || [];
        
        // Auto-complete ongoing interviews that have been running for 30+ minutes
        await autoCompleteOngoingInterviews(interviewsData);
        
        // Fetch updated interviews after auto-completion
        const updatedResponse = await fetch(`/api/interviews?userId=${userId}`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setInterviews(updatedData.interviews || []);
        } else {
          setInterviews(interviewsData);
        }
      } else {
        // Failed to fetch interviews
        setInterviews([]);
      }
    } catch (error) {
      // Error fetching interviews
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/user?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUserPassportNumber(data.user.passportNumber || null);
          setUserSummary(data.user.userSummary || "");
          // Set verification status based on passport number
          if (data.user.passportNumber && data.user.passportNumber !== "VERIFIED") {
            setVerificationStatus('success');
          }
          // Update localStorage with fresh user data
          if (typeof window !== "undefined") {
            const currentUserData = localStorage.getItem("sessionUser");
            if (currentUserData) {
              const updatedUserData = JSON.parse(currentUserData);
              updatedUserData.passportNumber = data.user.passportNumber;
              updatedUserData.userSummary = data.user.userSummary;
              localStorage.setItem("sessionUser", JSON.stringify(updatedUserData));
            }
          }
        }
      } else {
        // Failed to fetch user data
      }
    } catch (error) {
      // Error fetching user data
    }
  };

  // Auto-complete interviews that have been ongoing for 30+ minutes
  const autoCompleteOngoingInterviews = async (interviews: any[]) => {
    const ongoingInterviews = interviews.filter(interview => interview.status === 'ONGOING');
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    
    for (const interview of ongoingInterviews) {
      if (interview.startedAt) {
        const startTime = new Date(interview.startedAt);
        if (startTime < thirtyMinutesAgo) {
          try {
            const response = await fetch('/api/interviews/update-status', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                interviewId: interview.id,
                status: 'COMPLETED',
                endedAt: new Date().toISOString(),
              }),
            });
            
            if (response.ok) {
              // Auto-completed interview after 30 minutes
            } else {
              // Failed to auto-complete interview
            }
          } catch (error) {
            // Error auto-completing interview
          }
        }
      }
    }
  };

  // Calculate real stats from interviews data
  const completedInterviews = interviews.filter(interview => interview.status === 'COMPLETED');
  const scoredInterviews = completedInterviews.filter(interview => interview.score !== null && interview.score !== undefined);
  
  // Calculate passing rate based on score (≥7 = PASS, <7 = FAIL)
  const passedInterviews = scoredInterviews.filter(interview => interview.score >= 7);
  const failedInterviews = scoredInterviews.filter(interview => interview.score < 7);
  
  // Calculate unique university-course pairs (modules)
  const uniqueModules = new Set();
  interviews.forEach(interview => {
    const universityName = interview.universities?.name || 'Unknown University';
    const courseName = interview.course || interview.title || 'General Interview';
    uniqueModules.add(`${universityName} - ${courseName}`);
  });
  
  const userStats = {
    interviewsGiven: interviews.length,
    completedInterviews: scoredInterviews.length,
    averageScore: scoredInterviews.length > 0 
      ? (scoredInterviews.reduce((sum, interview) => sum + interview.score, 0) / scoredInterviews.length).toFixed(1)
      : 0,
    passingRate: scoredInterviews.length > 0 
      ? Math.round((passedInterviews.length / scoredInterviews.length) * 100)
      : 0,
    modulesAssigned: uniqueModules.size,
  }

  // Transform interviews data for display
  const transformedInterviews = interviews.map(interview => ({
    id: interview.id,
    university: interview.universities?.name || "Unknown University",
    course: interview.course || interview.title || "General Interview",
    date: interview.createdAt ? new Date(interview.createdAt).toLocaleDateString() : "Unknown",
    score: interview.score || null,
    status: interview.status?.toLowerCase() || "pending",
    result: interview.result?.toLowerCase() || "pending",
    createdAt: interview.createdAt,
  }));

  const groupedInterviews = transformedInterviews.reduce(
    (acc, interview) => {
      const key = `${interview.university} - ${interview.course}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(interview)
      return acc
    },
    {} as Record<string, typeof transformedInterviews>,
  )

  // Sort interviews within each group by createdAt (oldest first)
  Object.keys(groupedInterviews).forEach(key => {
    groupedInterviews[key].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB; // Ascending order (oldest first)
    });
  });

  // Calculate number of question banks available
  const questionBankCount = Object.entries(groupedInterviews).filter(([moduleKey, interviewList]) => {
    const firstInterview = interviews.find(i => {
      const universityName = i.universities?.name || 'Unknown University';
      const courseName = i.course || i.title || 'General Interview';
      return `${universityName} - ${courseName}` === moduleKey;
    });
    return firstInterview?.universities?.question_bank;
  }).length;

  const handlePassportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPassportFile(file)
      setVerificationStatus('idle')
      // Automatically submit for verification when file is selected
      await submitPassportVerification(file)
    }
  }

  const handlePassportDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPassportDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setPassportFile(file);
      setVerificationStatus('idle');
      // Automatically submit for verification when file is dropped
      await submitPassportVerification(file);
    } else if (file) {
      // You could add a toast or error message here
      console.error("Passport must be a PDF file.");
    }
  };

  const handlePassportDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPassportDragOver(true);
  };

  const handlePassportDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPassportDragOver(true);
  };

  const handlePassportDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPassportDragOver(false);
  };

  // Global drag event handlers
  useEffect(() => {
    const handleGlobalDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDraggingFile(true);
      }
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Only set to false if we're leaving the window
      if (e.target === document.body || e.target === document.documentElement) {
        setIsDraggingFile(false);
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingFile(false);
    };

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    // Add global event listeners
    document.addEventListener('dragenter', handleGlobalDragEnter);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleGlobalDrop);
    document.addEventListener('dragover', handleGlobalDragOver);

    return () => {
      document.removeEventListener('dragenter', handleGlobalDragEnter);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('drop', handleGlobalDrop);
      document.removeEventListener('dragover', handleGlobalDragOver);
    };
  }, []);

  const submitPassportVerification = async (file: File) => {
    if (!userId) return;

    setVerifying(true);
    setVerificationStatus('verifying');

    try {
      // Upload file to AWS
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadResponse = await fetch("/api/upload-photo", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        const errorMessage = errorData.error || "Failed to upload document";
        throw new Error(errorMessage);
      }

      const uploadData = await uploadResponse.json();
      const docUrl = uploadData.url;

      // Call webhook API
      const webhookResponse = await fetch("https://hook.eu2.make.com/6ajn6fpcghjqsk5qs4u8aaqtdp66xazu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          docName: "passport",
          docUrl: docUrl,
        }),
      });

      // Check if verification failed
      if (webhookResponse.status === 401) {
        const errorData = await webhookResponse.json();
        if (errorData.verified === "failed") {
          setVerificationStatus('failed');
          return;
        }
      }

      if (!webhookResponse.ok) {
        throw new Error("Failed to submit verification");
      }

      // Success - verification completed
      setVerificationStatus('success');
      setPassportFile(null); // Clear the file input
      
      // Show success toast
      toast.success("Verification Successful!", {
        description: "Your passport has been verified successfully."
      })
      
      // Immediately update the passport number state to hide verification section
      // Set a temporary value to indicate verification is complete
      setUserPassportNumber("VERIFIED");
      
      // Also update localStorage immediately so the user can proceed
      if (typeof window !== "undefined") {
        const currentUserData = localStorage.getItem("sessionUser");
        if (currentUserData) {
          const updatedUserData = JSON.parse(currentUserData);
          updatedUserData.passportNumber = "VERIFIED";
          localStorage.setItem("sessionUser", JSON.stringify(updatedUserData));
        }
      }
      
      // Refresh user data to get actual updated passport number
      if (userId) {
        try {
          const userResponse = await fetch(`/api/user?userId=${userId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.user && userData.user.passportNumber) {
              setUserPassportNumber(userData.user.passportNumber);
              // Update localStorage with new user data
              if (typeof window !== "undefined") {
                const currentUserData = localStorage.getItem("sessionUser");
                if (currentUserData) {
                  const updatedUserData = JSON.parse(currentUserData);
                  updatedUserData.passportNumber = userData.user.passportNumber;
                  localStorage.setItem("sessionUser", JSON.stringify(updatedUserData));
                }
              }
            }
          }
        } catch (error) {
          // Failed to refresh user data
        }
      }
      
    } catch (error) {
      // Verification submission error
      setVerificationStatus('failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!passportFile || !userId) return;
    await submitPassportVerification(passportFile);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sessionUserId");
      localStorage.removeItem("sessionUser");
      router.replace("/login");
    }
  };

  const toggleFaq = (faqId: string) => {
    const newExpanded = new Set(expandedFaqs);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedFaqs(newExpanded);
  };

  const faqs = [
    {
      id: "getting-started",
      question: "How do I get started with University Exam Practice?",
      answer: "Getting started is easy! First, verify your identity by uploading your passport. Then, explore the learning materials and question banks. Finally, schedule and take your mock interviews to practice for the real thing."
    },
    {
      id: "identity-verification",
      question: "Why do I need to verify my identity?",
      answer: "Identity verification ensures that only authorized users can access the platform and take interviews. This helps maintain the integrity of the University interview process and protects your personal information."
    },
    {
      id: "interview-process",
      question: "What happens during a mock interview?",
      answer: "During a mock interview, you'll be connected with an AI interviewer who will ask you questions similar to those in the actual University interview. The system will monitor your responses, body language, and screen activity to provide comprehensive feedback."
    },
    {
      id: "technical-requirements",
      question: "What are the technical requirements for interviews?",
      answer: "You need a stable internet connection, a working microphone and camera, and a modern web browser. Screen sharing is required for monitoring purposes. Make sure your device meets these requirements before starting an interview."
    },
    {
      id: "scoring-system",
      question: "How is my interview score calculated?",
      answer: "Your score is based on multiple factors including answer quality, communication skills, technical knowledge, and overall performance. Scores range from 0-10, with 7+ considered a passing score."
    },
    {
      id: "rescheduling",
      question: "Can I reschedule my interview?",
      answer: "Yes, you can reschedule your interview up to 24 hours before the scheduled time. Simply go to your interviews section and click on the interview you want to reschedule."
    },
    {
      id: "support",
      question: "How can I get technical support?",
      answer: "If you encounter technical issues, you can contact our support team through the contact form, email us directly, or check our troubleshooting guides in the FAQs section."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickLinks = [
    {
      title: "Technical Requirements",
      description: "Check if your device meets all requirements",
      icon: Zap,
      color: "bg-green-500",
      href: "#technical-requirements"
    },
    {
      title: "Interview Tips",
      description: "Essential tips for successful interviews",
      icon: Star,
      color: "bg-yellow-500",
      href: "#interview-tips"
    }
  ];

  const contactMethods = [
    {
      title: "Email Support",
      description: "Get help via email",
      icon: Mail,
      contact: "support@muskan.ai",
      response: "Within 24 hours"
    },
    {
      title: "Website",
      description: "Chat with our support team",
      icon: MessageCircle,
      contact: "muskan.ai",
      response: "Instant response"
    },
    {
      title: "Phone Support",
      description: "Call us directly",
      icon: Phone,
      contact: "+917412067054",
      response: "Mon-Fri 9AM-6PM"
    }
  ];

  const checkRequirements = async () => {
    setIsChecking(true)
    
    // Check browser compatibility
    const browserInfo = getBrowserInfo()
    const isCompatible = browserInfo.compatible
    
    // Check device capabilities
    const hasCamera = 'mediaDevices' in navigator
    const hasMicrophone = 'mediaDevices' in navigator
    
    // Check internet speed (simplified)
    const internetSpeed = await checkInternetSpeed()
    

    
    const newRequirements = {
      camera: { available: hasCamera, testing: false, tested: true },
      microphone: { available: hasMicrophone, testing: false, tested: true },
      internet: { available: internetSpeed > 1, speed: internetSpeed, tested: true },
      browser: { compatible: isCompatible, name: browserInfo.name, version: browserInfo.version, tested: true }
    }
    
    setRequirements(newRequirements)
    
    // Determine overall status - only check the requirements we actually show
    const allReady = newRequirements.camera.tested && newRequirements.camera.available &&
                    newRequirements.microphone.tested && newRequirements.microphone.available &&
                    newRequirements.internet.tested && newRequirements.internet.available &&
                    newRequirements.browser.tested && newRequirements.browser.compatible
    
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
    const startTime = Date.now()
    try {
      await fetch('/api/ping', { method: 'HEAD' })
      const endTime = Date.now()
      const duration = endTime - startTime
      return Math.max(1, 10 - (duration / 100))
    } catch {
      return 1
    }
  }



  const testCamera = async () => {
    setRequirements(prev => ({
      ...prev,
      camera: { ...prev.camera, testing: true }
    }))
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      
      // Show live preview
      setCameraPreview(stream)
      
      // Keep stream active for 5 seconds to show preview
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop())
        setCameraPreview(null)
        
        setRequirements(prev => ({
          ...prev,
          camera: { available: true, testing: false, tested: true }
        }))
      }, 5000)
      
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
      
      // Show microphone preview
      setMicrophonePreview(stream)
      
      // Keep stream active for 5 seconds to show preview
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop())
        setMicrophonePreview(null)
        
        setRequirements(prev => ({
          ...prev,
          microphone: { available: true, testing: false, tested: true }
        }))
      }, 5000)
      
    } catch (error) {
      setRequirements(prev => ({
        ...prev,
        microphone: { available: false, testing: false, tested: true }
      }))
    }
  }



  const getStatusIcon = (status: boolean) => {
    return status ? (
      <div className="w-5 h-5 text-green-600 flex items-center justify-center">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
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

  const sidebarItems = [
    { id: "overview", label: "Dashboard", icon: Home, count: null },
    { id: "interviews", label: "Interviews", icon: GraduationCap, count: interviews.length },
    { id: "learn", label: "Learn", icon: BookOpen, count: questionBankCount },
    { id: "help", label: "Help Center", icon: HelpCircle, count: null },
  ];

  // 1. Add a reusable function for the 'Your Interviews' section above the DashboardPage component
  function YourInterviewsSection({
    loading,
    interviews,
    groupedInterviews,
    router
  }: {
    loading: boolean;
    interviews: any[];
    groupedInterviews: Record<string, any[]>;
    router: any;
  }) {
    return (
      <div className="space-y-8">
        {loading ? (
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-[#bbb] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#212529] mb-2">No interviews yet</h3>
            <p className="text-[#6c757d]">Your interviews will appear here once they are scheduled</p>
          </div>
        ) : (
          Object.entries(groupedInterviews).map(([moduleKey, interviewList]) => {
            // Get the first interview to extract university info and question bank URL
            const firstInterview = interviews.find(i => {
              const universityName = i.universities?.name || 'Unknown University';
              const courseName = i.course || i.title || 'General Interview';
              return `${universityName} - ${courseName}` === moduleKey;
            });
            return (
              <div key={moduleKey} className="rounded-lg">
                <div className="p-6 border-b border-gray-200 bg-white border-2 border-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {/* University Logo */}
                      <div className="w-12 h-12 rounded-lg bg-[#ececec] flex items-center justify-center text-[#222] font-bold text-base mr-4">
                        {firstInterview?.universities?.logo_url ? (
                          <img 
                            src={firstInterview.universities.logo_url} 
                            alt={firstInterview.universities.name}
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          firstInterview?.universities?.name?.charAt(0) || 'U'
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-[#212529] flex items-center">
                          <MapPin className="w-5 h-5 mr-2 text-[#6c757d]" />
                          {moduleKey}
                        </h3>
                        <p className="text-sm text-[#6c757d] mt-1">
                          {interviewList.length} interview{interviewList.length !== 1 ? 's' : ''} in this mock units
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-6 border-l-[12px] border-r-[12px] border-b-[12px] border-white rounded-b-2xl">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {interviewList.map((interview: any, index: number) => {
                       // Find the original interview data to pass to InterviewCard
                       const originalInterview = interviews.find((i: any) => i.id === interview.id);
                       return originalInterview ? (
                         <InterviewCard
                           key={interview.id}
                           interview={originalInterview}
                           interviewNumber={index + 1}
                           onJoinInterview={(interviewId: string) => {
                             // Use originalInterview and its nested university/interviewer
                             const universityObj = originalInterview.universities || null;
                             const interviewerObj = originalInterview.interviewers || null;
                                     // Debug information logged
                             const sessionData = {
                               interview: originalInterview,
                               user,
                               university: universityObj,
                               interviewer: interviewerObj
                             };
                             sessionStorage.setItem('meetingPreviewData', JSON.stringify(sessionData));
                             router.push(`/meeting/${interviewId}`);
                           }}
                           passportNumber={userPassportNumber}
                         />
                       ) : null;
                     })}
                   </div>
                  </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  // In DashboardPage, define universities and interviewers from interviews data
  const universities = interviews.map(i => i.universities).filter(Boolean);
  const interviewers = interviews.map(i => i.interviewer).filter(Boolean);
  const user = { name: userName, email: userEmail, passportNumber: userPassportNumber, userSummary: userSummary };



  return (
    <>
      <Toaster />
      <div className="h-screen w-screen flex overflow-hidden relative bg-background">
      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)} />
      {/* Sidebar */}
      <div className={`fixed z-50 top-0 left-0 w-72 bg-white flex flex-col shadow-lg transition-transform duration-300 md:static md:w-80 md:shadow-none m-3 rounded-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} style={{background: '#fff', borderRadius: 12, margin: 12, maxHeight: 'calc(100vh - 24px)'}}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center">
              <img src="/favicon.png" alt="favicon" className="w-7 h-7 rounded-lg" />
            </div>
            <span className="text-lg font-bold text-[#222] tracking-tight">University Interview Practice</span>
          </div>
          {/* Hamburger close button on mobile */}
          <button className="md:hidden p-2 ml-2" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {/* Navigation */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setSelectedTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors font-medium ${
                  selectedTab === item.id
                    ? "bg-[#f6f6f6] text-[#222]"
                    : "text-[#888] hover:bg-[#f6f6f6] hover:text-[#222]"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.count && (
                  <span className="text-xs bg-[#f3f3f3] text-[#888] px-2 py-1 rounded-full">{item.count}</span>
                )}
              </button>
            ))}
          </div>
          

          
          {/* Bottom aligned sections */}
          <div className="mt-auto">
            {/* Path to Success Section */}
            {!isShortScreen && (
              <div className="mt-8 hidden md:block">
                <div className="text-xs font-semibold text-[#bbb] uppercase tracking-wider mb-3 px-3">Your Path to Success</div>
                <div className="space-y-3 px-3">
                  {/* Step 1 */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}>1</div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-[#222] mb-1">Verify Documents</div>
                      <div className="text-xs text-[#888] leading-relaxed">Review and submit all required documents to get started.</div>
                    </div>
                  </div>
                  {/* Step 2 */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #DC143C 0%, #FF4500 100%)' }}>2</div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-[#222] mb-1">Learn for Pre CAS</div>
                      <div className="text-xs text-[#888] leading-relaxed">Access essential tips, tricks, and question banks to prepare thoroughly for your interview.</div>
                    </div>
                  </div>
                  {/* Step 3 */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}>3</div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-[#222] mb-1">Give Mock Interview</div>
                      <div className="text-xs text-[#888] leading-relaxed">Practice with AI-powered mock interviews to build confidence and improve your skills.</div>
                    </div>
                  </div>
                  {/* Step 4 */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #DC143C 0%, #FF4500 100%)' }}>4</div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-[#222] mb-1">Complete Round 1</div>
                      <div className="text-xs text-[#888] leading-relaxed">Take your actual Pre CAS interview with confidence and demonstrate your readiness.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* User Profile (sidebar, original position and style) */}
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#e0e0e0] rounded-full flex items-center justify-center text-[#222] text-sm font-bold">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#222] truncate">{userName || "User"}</div>
              <div className="text-xs text-[#bbb] truncate">{userEmail || "user@example.com"}</div>
            </div>
            <button onClick={handleLogout} className="text-[#bbb] hover:text-[#222] text-xs px-2 py-1 rounded border border-[#ececec]">Logout</button>
          </div>
        </div>
      </div>
      {/* Hamburger open button on mobile */}
      <button className="fixed top-4 left-4 z-50 p-2 bg-white rounded shadow md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full max-h-screen overflow-y-auto">
        {/* Content Area */}
        <div className="flex-1 pt-2 md:pt-4 px-4 md:px-8 overflow-auto">
          <h1 className="pt-[12px] pb-[12px] pl-[6px] text-2xl md:text-3xl font-medium text-[#222] tracking-tight truncate mb-4">{sidebarItems.find((item) => item.id === selectedTab)?.label || "Dashboard"}</h1>
          {selectedTab === "overview" && (
            <div className="max-w-6xl pb-10">
              {/* Compact Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="bg-white rounded-lg p-4 flex flex-col items-start">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-[#8B0000] mr-2" />
                    <span className="text-xs text-[#888]">Interviews</span>
                  </div>
                  <div className="text-2xl font-extrabold text-[#222] leading-tight">{userStats.interviewsGiven}</div>
                  <div className="text-xs text-[#bbb] mt-1">Assigned</div>
                </div>
                <div className="bg-white rounded-lg p-4 flex flex-col items-start">
                  <div className="flex items-center mb-2">
                    <Award className="w-5 h-5 text-[#DC143C] mr-2" />
                    <span className="text-xs text-[#888]">Avg. Score</span>
                  </div>
                  <div className="text-2xl font-extrabold text-[#222] leading-tight">{userStats.averageScore}</div>
                  <div className="text-xs text-[#bbb] mt-1">/10 ({userStats.completedInterviews})</div>
                </div>
                <div className="bg-white rounded-lg p-4 flex flex-col items-start">
                  <div className="flex items-center mb-2">
                    <Target className="w-5 h-5 text-[#FF4500] mr-2" />
                    <span className="text-xs text-[#888]">Passing</span>
                  </div>
                  <div className="text-2xl font-extrabold text-[#222] leading-tight">{userStats.passingRate}%</div>
                  <div className="text-xs text-[#bbb] mt-1">Rate</div>
                </div>
                <div className="bg-white rounded-lg p-4 flex flex-col items-start">
                  <div className="flex items-center mb-2">
                    <BookOpen className="w-5 h-5 text-[#8B0000] mr-2" />
                    <span className="text-xs text-[#888]">Mock Units</span>
                  </div>
                  <div className="text-2xl font-extrabold text-[#222] leading-tight">{userStats.modulesAssigned}</div>
                  <div className="text-xs text-[#bbb] mt-1">Assigned</div>
                </div>
              </div>



              {/* Identity Verification Section - Only show if user needs to verify passport */}
              {(!userPassportNumber || userPassportNumber.trim() === '') && verificationStatus !== 'success' && (
                <div className="mb-10">
                  <div className="mb-4">
                    <h2 className="text-xl font-medium text-[#212529] mb-1">Identity Verification</h2>
                    <p className="text-[#6c757d]">Upload your passport to automatically verify your identity</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 pb-2">
                      <h3 className="text-lg font-medium text-[#212529] flex items-center">
                        <Camera className="w-5 h-5 mr-2 text-[#8B0000]" />
                        Upload and Verify your Passport <span className="text-[#8B0000]">*</span>
                      </h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                          isPassportDragOver || isDraggingFile
                            ? 'border-blue-400 bg-blue-50' 
                            : 'border-[#dee2e6] hover:border-[#6c757d] bg-[#f8f9fa]'
                        }`}
                        onDrop={handlePassportDrop}
                        onDragOver={handlePassportDragOver}
                        onDragEnter={handlePassportDragEnter}
                        onDragLeave={handlePassportDragLeave}
                      >
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handlePassportUpload}
                          className="hidden"
                          id="passport-upload"
                        />
                        <label htmlFor="passport-upload" className="cursor-pointer">
                          <Upload className={`w-10 h-10 mx-auto mb-3 ${isPassportDragOver || isDraggingFile ? 'text-blue-500' : 'text-[#6c757d]'}`} />
                          <div className="text-base font-medium text-[#212529] mb-1">
                            {isPassportDragOver || isDraggingFile
                              ? "Drop your passport here (PDF)" 
                              : passportFile ? passportFile.name : "Upload your passport"
                            }
                          </div>
                          <div className="text-sm text-[#6c757d]">
                            {isPassportDragOver || isDraggingFile ? "Release to verify" : "Drag and drop or click to browse (PDF only)"}
                          </div>
                        </label>
                      </div>

                      {passportFile && verificationStatus === 'idle' && (
                        <div className="bg-[#fff3cd] border border-[#ffeaa7] rounded-lg p-3">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-[#ffc107] rounded-full flex items-center justify-center mr-2">
                              <FileText className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-[#856404] text-sm">File added successfully</div>
                              <div className="text-xs text-[#856404]">Starting verification...</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {verificationStatus === 'failed' && (
                        <div className="bg-[#f8d7da] border border-[#f5c6cb] rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-[#dc3545] rounded-full flex items-center justify-center mr-2">
                                <XCircle className="w-3 h-3 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-[#721c24] text-sm">Verification Failed</div>
                                <div className="text-xs text-[#721c24]">Please provide a clear image of your passport and try again</div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPassportFile(null);
                                setVerificationStatus('idle');
                              }}
                              className="text-[#721c24] border-[#dc3545] hover:bg-[#dc3545] hover:text-white"
                            >
                              Try Again
                            </Button>
                          </div>
                        </div>
                      )}

                      {verifying && (
                        <div className="w-full bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <SquareDotsLoader />
                            <span className="text-gray-800 text-sm font-medium">Verifying your passport...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* First Three Question Banks */}
              {(() => {
                // Collect first three question banks from interviews
                const questionBanks = [];
                const seen = new Set();
                for (const interview of interviews) {
                  const uni = interview.universities;
                  if (
                    uni?.question_bank &&
                    !seen.has(uni.id + '-' + (interview.course || interview.title || 'General Interview'))
                  ) {
                    questionBanks.push({
                      university: uni.name,
                      logo_url: uni.logo_url,
                      course: interview.course || interview.title || 'General Interview',
                      question_bank: uni.question_bank,
                    });
                    seen.add(uni.id + '-' + (interview.course || interview.title || 'General Interview'));
                  }
                  if (questionBanks.length === 3) break;
                }
                if (questionBanks.length === 0) return null;
                return (
                  <div className="mb-10">
                    <h2 className="text-xl font-semibold text-[#222] mb-4">Question Banks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {questionBanks.map((qb, idx) => (
                        <div key={idx} className="bg-white rounded-lg flex flex-col items-center p-6">
                          <div className="w-16 h-16 rounded-lg bg-[#ececec] flex items-center justify-center text-[#222] font-bold text-xl mb-3">
                            {qb.logo_url ? (
                              <img src={qb.logo_url} alt={qb.university} className="w-full h-full rounded-lg object-cover" />
                            ) : (
                              qb.university?.charAt(0) || 'U'
                            )}
                          </div>
                          <div className="text-lg font-medium text-[#212529] text-center">{qb.university}</div>
                          <div className="text-sm text-[#6c757d] text-center mb-4">{qb.course}</div>
                          <Button
                            variant="outline"
                            className="w-full bg-white border-[#dee2e6] text-[#212529] hover:bg-[#f8f9fa]"
                            asChild
                          >
                            <a href={qb.question_bank} target="_blank" rel="noopener noreferrer">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Access Question Bank
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Your Interviews Section (shared) */}
              <div className="mb-10">
                <h2 className="text-2xl md:text-2xl font-medium text-[#222] tracking-tight truncate mb-0.5" style={{ fontSize: '1.5rem' }}>Interviews</h2>
              </div>
              <YourInterviewsSection
                loading={loading}
                interviews={interviews}
                groupedInterviews={groupedInterviews}
                router={router}
              />


            </div>
          )}

          {selectedTab === "interviews" && (
            <div className="max-w-6xl pb-10">
              <YourInterviewsSection
                loading={loading}
                interviews={interviews}
                groupedInterviews={groupedInterviews}
                router={router}
              />
            </div>
          )}

          {selectedTab === "learn" && (
            <div className="max-w-6xl pb-10">
              {/* Tips & Tricks Section */}
              <div className="mb-10">
                <div className="mb-6">
                  <h2 className="text-2xl md:text-2xl font-medium text-[#222] tracking-tight truncate mb-1" style={{ fontSize: '1.5rem' }}>How to Crack University Interview</h2>
                  <p className="text-[#6c757d] mt-0.5">10 Essential Tips & Tricks for Success</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl border border-[#f8f9fa] p-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B0000] to-[#DC143C] flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">1</div>
                      <p className="text-[#212529] text-sm leading-relaxed font-medium flex-1">Dress professionally and appropriately for your interview.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#f8f9fa] p-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DC143C] to-[#FF4500] flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">2</div>
                      <p className="text-[#212529] text-sm leading-relaxed font-medium flex-1">Stay focused on the topic and provide clear, direct answers.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#f8f9fa] p-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B0000] to-[#DC143C] flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">3</div>
                      <p className="text-[#212529] text-sm leading-relaxed font-medium flex-1">Ensure your answers are truthful and consistent with your application materials.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#f8f9fa] p-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DC143C] to-[#FF4500] flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">4</div>
                      <p className="text-[#212529] text-sm leading-relaxed font-medium flex-1">Speak clearly, confidently, and at a measured pace.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#f8f9fa] p-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B0000] to-[#DC143C] flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">5</div>
                      <p className="text-[#212529] text-sm leading-relaxed font-medium flex-1">Don't hesitate to ask for clarification if you don't understand a question.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#f8f9fa] p-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DC143C] to-[#FF4500] flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">6</div>
                      <p className="text-[#212529] text-sm leading-relaxed font-medium flex-1">Have all required documents and identification ready before the interview.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#f8f9fa] p-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B0000] to-[#DC143C] flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">7</div>
                      <p className="text-[#212529] text-sm leading-relaxed font-medium flex-1">Ensure you have a stable internet connection and good audio/video quality.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#f8f9fa] p-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DC143C] to-[#FF4500] flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">8</div>
                      <p className="text-[#212529] text-sm leading-relaxed font-medium flex-1">Make sure your device is fully charged and ready for the interview.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#f8f9fa] p-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B0000] to-[#DC143C] flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">9</div>
                      <p className="text-[#212529] text-sm leading-relaxed font-medium flex-1">Choose a quiet, professional background for your interview.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-[#f8f9fa] p-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DC143C] to-[#FF4500] flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">10</div>
                      <p className="text-[#212529] text-sm leading-relaxed font-medium flex-1">Practice with mock interviews to build confidence and improve your skills.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Banks Section */}
              <div className="mb-6">
                <h2 className="text-xl font-medium text-[#212529] mb-2">Question Banks</h2>
                <p className="text-[#6c757d]">Access question banks for your interview Mock Units</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="bg-white rounded-lg border border-[#ececec] animate-pulse">
                      <div className="p-6 border-b border-[#ececec]">
                        <div className="h-6 bg-[#ececec] rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-[#ececec] rounded w-1/2"></div>
                      </div>
                      <div className="p-6">
                        <div className="h-10 bg-[#ececec] rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : interviews.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-[#bbb] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#212529] mb-2">No question banks available</h3>
                  <p className="text-[#6c757d]">Question banks will appear here once you have scheduled interviews</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(groupedInterviews).map(([moduleKey, interviewList]) => {
                    // Get the first interview to extract university info and question bank URL
                    const firstInterview = interviews.find(i => {
                      const universityName = i.universities?.name || 'Unknown University';
                      const courseName = i.course || i.title || 'General Interview';
                      return `${universityName} - ${courseName}` === moduleKey;
                    });

                    // Only show modules that have question banks
                    if (!firstInterview?.universities?.question_bank) {
                      return null;
                    }

                    return (
                      <div
                        key={moduleKey}
                        className="bg-white rounded-lg"
                      >
                        <div className="p-6 border-b border-[#ececec]">
                          <div className="flex items-center space-x-3 mb-3">
                            {/* University Logo */}
                            <div className="w-12 h-12 rounded-lg bg-[#ececec] flex items-center justify-center text-[#222] font-bold text-sm">
                              {firstInterview?.universities?.logo_url ? (
                                <img 
                                  src={firstInterview.universities.logo_url} 
                                  alt={firstInterview.universities.name}
                                  className="w-full h-full rounded-lg object-cover"
                                />
                              ) : (
                                firstInterview?.universities?.name?.charAt(0) || 'U'
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-[#212529]">{firstInterview.universities?.name}</h3>
                              <p className="text-sm text-[#6c757d]">{firstInterview.course || firstInterview.title}</p>
                            </div>
                          </div>
                          <div className="text-sm text-[#6c757d]">
                            {interviewList.length} interview{interviewList.length !== 1 ? 's' : ''} in this mock units
                          </div>
                        </div>
                        <div className="p-6">
                          <Button
                            variant="outline"
                            className="w-full bg-white border-[#dee2e6] text-[#212529] hover:bg-[#f8f9fa]"
                            asChild
                          >
                            <a href={firstInterview.universities.question_bank} target="_blank" rel="noopener noreferrer">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Access Question Bank
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Show message if no question banks are available */}
              {!loading && interviews.length > 0 && 
               Object.entries(groupedInterviews).every(([moduleKey, interviewList]) => {
                 const firstInterview = interviews.find(i => {
                   const universityName = i.universities?.name || 'Unknown University';
                   const courseName = i.course || i.title || 'General Interview';
                   return `${universityName} - ${courseName}` === moduleKey;
                 });
                 return !firstInterview?.universities?.question_bank;
               }) && (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-[#bbb] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#212529] mb-2">No question banks available</h3>
                  <p className="text-[#6c757d]">Your current interview Mock Units don't have question banks yet</p>
                </div>
              )}
            </div>
          )}

          {selectedTab === "help" && (
            <div className="max-w-6xl space-y-8 pb-8">
              {/* Help Navigation Tabs */}
              <div className="flex space-x-1 bg-white rounded-lg p-1">
                {[
                  { id: "overview", label: "Overview", icon: HelpCircle },
                  { id: "requirements", label: "Technical Requirements", icon: Zap },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setHelpSelectedTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      helpSelectedTab === tab.id
                        ? "bg-[#f6f6f6] text-[#222]"
                        : "text-[#888] hover:bg-[#f6f6f6] hover:text-[#222]"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {helpSelectedTab === "overview" && (
                <>
                  {/* Welcome Section */}
                  <div className="bg-white rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}>
                        <HelpCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-medium text-[#222]">Welcome to Help Center</h2>
                        <p className="text-[#888]">Find answers to common questions and get support</p>
                      </div>
                    </div>
                    <p className="text-[#888] leading-relaxed">
                      We're here to help you succeed in your Pre CAS interview preparation. Whether you need technical support, 
                      have questions about the interview process, or want to learn more about our platform, you'll find everything you need here.
                    </p>
                  </div>

                  {/* Quick Links Grid */}
                  <div>
                    <h3 className="text-lg font-medium text-[#222] mb-4">Quick Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quickLinks.map((link, index) => (
                        <div key={index} className="bg-white rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`} style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}>
                              <link.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-[#222] mb-1">{link.title}</h4>
                              <p className="text-sm text-[#888] mb-2">{link.description}</p>
                              <button 
                                onClick={() => {
                                  if (link.title === "Interview Tips" || link.title === "Download Resources") {
                                    setSelectedTab("learn");
                                  } else if (link.title === "Technical Requirements") {
                                    setHelpSelectedTab("requirements");
                                  }
                                }}
                                className="text-[#8B0000] hover:text-[#DC143C] text-sm font-medium flex items-center transition-colors"
                              >
                                Learn more <ArrowRight className="w-3 h-3 ml-1" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FAQs Section */}
                  <div>
                    <h3 className="text-lg font-medium text-[#222] mb-4">Frequently Asked Questions</h3>

                    {/* FAQs List */}
                    <div className="bg-white rounded-lg">
                      {faqs.map((faq, index) => (
                        <div key={faq.id} className={`p-4 ${index !== 0 ? 'border-t border-[#ececec]' : ''}`}>
                          <button
                            onClick={() => toggleFaq(faq.id)}
                            className="w-full flex items-center justify-between text-left hover:bg-[#f6f6f6] rounded-md p-2 transition-colors"
                          >
                            <span className="font-medium text-[#222]">{faq.question}</span>
                            {expandedFaqs.has(faq.id) ? (
                              <ChevronUp className="w-4 h-4 text-[#888]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#888]" />
                            )}
                          </button>
                          {expandedFaqs.has(faq.id) && (
                            <p className="text-[#888] mt-2 leading-relaxed px-2">{faq.answer}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div>
                    <h3 className="text-lg font-medium text-[#222] mb-4">Contact Support</h3>
                    
                    {/* Contact Information */}
                    <div className="bg-white rounded-lg p-6 mb-6">
                      <p className="text-[#888] mb-6">
                        Need help? Our support team is here to assist you. Choose the contact method that works best for you.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {contactMethods.map((method, index) => (
                          <div 
                            key={index} 
                            className={`border border-[#ececec] rounded-lg p-4 text-center hover:shadow-md transition-shadow ${method.title === "Live Chat" ? "cursor-pointer" : ""}`}
                            onClick={() => {
                              if (method.title === "Live Chat") {
                                window.open("https://muskan.ai", "_blank");
                              }
                            }}
                          >
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}>
                              <method.icon className="w-6 h-6 text-white" />
                            </div>
                            <h5 className="font-medium text-[#222] mb-1">{method.title}</h5>
                            <p className="text-sm text-[#888] mb-2">{method.description}</p>
                            <p className="text-sm font-medium text-[#222] mb-1">{method.contact}</p>
                            <p className="text-xs text-[#888]">{method.response}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {helpSelectedTab === "requirements" && (
                <div className="space-y-6">
                  {/* Overall Status */}
                  <div className="bg-white rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-medium text-[#222]">System Requirements Check</h2>
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
                        <div className="w-8 h-8 text-green-600 flex items-center justify-center">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
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

                  {/* Requirements Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Camera */}
                    <div className="bg-white rounded-lg p-6">
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
                        
                        {/* Camera Preview */}
                        {cameraPreview && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-2">Camera Preview (5 seconds)</p>
                            <video
                              ref={(el) => {
                                if (el) el.srcObject = cameraPreview;
                              }}
                              autoPlay
                              muted
                              className="w-full h-32 object-cover rounded border"
                            />
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
                    <div className="bg-white rounded-lg p-6">
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
                        
                        {/* Microphone Preview */}
                        {microphonePreview && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-2">Microphone Preview (5 seconds)</p>
                            <div className="flex items-center space-x-2">
                              <Mic className="w-4 h-4 text-green-600" />
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-100"
                                  style={{ width: '60%' }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">Active</span>
                            </div>
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
                    <div className="bg-white rounded-lg p-6">
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
                    <div className="bg-white rounded-lg p-6">
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




                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


    </div>
    </>
  )
}
