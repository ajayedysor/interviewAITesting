"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  CheckCircle,
  MessageCircle,
  Video,
  Mic,
  Wifi,
  AlertCircle,
  Info,
  Mail,
  Phone,
  Clock,
  Globe,
  Download,
  Play,
  FileQuestion,
  Users,
  Zap,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

export default function HelpCenterPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("sessionUser");
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserName(user.name || "");
          setUserEmail(user.email || "");
        } catch {
          setUserName("");
          setUserEmail("");
        }
      }

      // Check for URL parameters to set initial tab
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['faqs', 'contact'].includes(tabParam)) {
        setSelectedTab(tabParam);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sessionUser");
    localStorage.removeItem("sessionUserId");
    router.push("/login");
  };

  const sidebarItems = [
    { id: "overview", label: "Help Center", icon: HelpCircle, count: null },
    { id: "faqs", label: "FAQs", icon: FileQuestion, count: null },
    { id: "contact", label: "Contact", icon: MessageCircle, count: null },
  ];

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
      question: "How do I get started with Pre CAS Practice?",
      answer: "Getting started is easy! First, verify your identity by uploading your passport. Then, explore the learning materials and question banks. Finally, schedule and take your mock interviews to practice for the real thing."
    },
    {
      id: "identity-verification",
      question: "Why do I need to verify my identity?",
      answer: "Identity verification ensures that only authorized users can access the platform and take interviews. This helps maintain the integrity of the Pre CAS interview process and protects your personal information."
    },
    {
      id: "interview-process",
      question: "What happens during a mock interview?",
      answer: "During a mock interview, you'll be connected with an AI interviewer who will ask you questions similar to those in the actual Pre CAS interview. The system will monitor your responses, body language, and screen activity to provide comprehensive feedback."
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
      title: "Getting Started Guide",
      description: "Step-by-step guide to begin your Pre CAS journey",
      icon: Play,
      color: "bg-blue-500",
      href: "#getting-started"
    },
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
    },
    {
      title: "Download Resources",
      description: "Access study materials and guides",
      icon: Download,
      color: "bg-purple-500",
      href: "#resources"
    }
  ];

  const contactMethods = [
    {
      title: "Email Support",
      description: "Get help via email",
      icon: Mail,
      contact: "support@precas.com",
      response: "Within 24 hours"
    },
    {
      title: "Live Chat",
      description: "Chat with our support team",
      icon: MessageCircle,
      contact: "Available 9AM-6PM",
      response: "Instant response"
    },
    {
      title: "Phone Support",
      description: "Call us directly",
      icon: Phone,
      contact: "+1 (555) 123-4567",
      response: "Mon-Fri 9AM-6PM"
    }
  ];

  return (
    <div className="h-screen w-screen flex overflow-hidden relative bg-background">
      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)} />
      
      {/* Sidebar */}
      <div className={`fixed z-50 top-0 left-0 w-72 bg-white flex flex-col shadow-lg transition-transform duration-300 md:static md:w-80 md:shadow-none m-3 rounded-xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`} style={{background: '#fff', borderRadius: 12, margin: 12, maxHeight: 'calc(100vh - 24px)'}}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center">
              <img src="/favicon.png" alt="favicon" className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-[#222] tracking-tight">Pre CAS Practice</span>
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
          
          {/* Resources Section - Moved to top */}
          <div className="mt-8">
            <div className="text-xs font-semibold text-[#bbb] uppercase tracking-wider mb-3 px-3">Resources</div>
            <div className="space-y-1">
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-[#bbb] hover:bg-[#f6f6f6] hover:text-[#222] rounded-md transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-[#bbb] hover:bg-[#f6f6f6] hover:text-[#222] rounded-md transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
          
          {/* Bottom aligned sections */}
          <div className="mt-auto">
            {/* Quick Help Section */}
            <div className="mt-8">
              <div className="text-xs font-semibold text-[#bbb] uppercase tracking-wider mb-3 px-3">Quick Help</div>
              <div className="space-y-3 px-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #8B0000 0%, #DC143C 100%)' }}>
                    <HelpCircle className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[#222] mb-1">Need Help?</div>
                    <div className="text-xs text-[#888] leading-relaxed">Check our FAQs or contact support for assistance.</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #DC143C 0%, #FF4500 100%)' }}>
                    <Video className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[#222] mb-1">Technical Issues?</div>
                    <div className="text-xs text-[#888] leading-relaxed">Ensure your camera, microphone, and internet are working.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* User Profile */}
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
          <h1 className="pt-[12px] pb-[12px] pl-[6px] text-2xl md:text-3xl font-medium text-[#222] tracking-tight truncate mb-4">
            {sidebarItems.find((item) => item.id === selectedTab)?.label || "Help Center"}
          </h1>
          
          {selectedTab === "overview" && (
            <div className="max-w-6xl space-y-8">
              {/* Welcome Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <HelpCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-[#212529]">Welcome to Help Center</h2>
                    <p className="text-[#6c757d]">Find answers to common questions and get support</p>
                  </div>
                </div>
                <p className="text-[#6c757d] leading-relaxed">
                  We're here to help you succeed in your Pre CAS interview preparation. Whether you need technical support, 
                  have questions about the interview process, or want to learn more about our platform, you'll find everything you need here.
                </p>
              </div>

              {/* Quick Links Grid */}
              <div>
                <h3 className="text-lg font-medium text-[#212529] mb-4">Quick Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickLinks.map((link, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 ${link.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <link.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-[#212529] mb-1">{link.title}</h4>
                          <p className="text-sm text-[#6c757d] mb-2">{link.description}</p>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                            Learn more <ArrowRight className="w-3 h-3 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular FAQs */}
              <div>
                <h3 className="text-lg font-medium text-[#212529] mb-4">Popular Questions</h3>
                <div className="bg-white rounded-lg shadow-sm">
                  {faqs.slice(0, 3).map((faq, index) => (
                    <div key={faq.id} className={`p-4 ${index !== 0 ? 'border-t border-gray-100' : ''}`}>
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <span className="font-medium text-[#212529]">{faq.question}</span>
                        {expandedFaqs.has(faq.id) ? (
                          <ChevronUp className="w-4 h-4 text-[#6c757d]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#6c757d]" />
                        )}
                      </button>
                      {expandedFaqs.has(faq.id) && (
                        <p className="text-[#6c757d] mt-2 leading-relaxed">{faq.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === "faqs" && (
            <div className="max-w-4xl space-y-6">
              {/* Search */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6c757d]" />
                  <Input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* FAQs List */}
              <div className="bg-white rounded-lg shadow-sm">
                {filteredFaqs.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileQuestion className="w-12 h-12 text-[#bbb] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[#212529] mb-2">No results found</h3>
                    <p className="text-[#6c757d]">Try adjusting your search terms</p>
                  </div>
                ) : (
                  filteredFaqs.map((faq, index) => (
                    <div key={faq.id} className={`p-4 ${index !== 0 ? 'border-t border-gray-100' : ''}`}>
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <span className="font-medium text-[#212529]">{faq.question}</span>
                        {expandedFaqs.has(faq.id) ? (
                          <ChevronUp className="w-4 h-4 text-[#6c757d]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#6c757d]" />
                        )}
                      </button>
                      {expandedFaqs.has(faq.id) && (
                        <p className="text-[#6c757d] mt-2 leading-relaxed">{faq.answer}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {selectedTab === "contact" && (
            <div className="max-w-4xl space-y-8">
              {/* Contact Information */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-[#212529] mb-4">Get in Touch</h3>
                <p className="text-[#6c757d] mb-6">
                  Need help? Our support team is here to assist you. Choose the contact method that works best for you.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <method.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-[#212529] mb-1">{method.title}</h4>
                      <p className="text-sm text-[#6c757d] mb-2">{method.description}</p>
                      <p className="text-sm font-medium text-[#212529] mb-1">{method.contact}</p>
                      <p className="text-xs text-[#6c757d]">{method.response}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-[#212529] mb-4">Send us a Message</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#212529] mb-1">First Name</label>
                      <Input type="text" placeholder="Enter your first name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#212529] mb-1">Last Name</label>
                      <Input type="text" placeholder="Enter your last name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#212529] mb-1">Email</label>
                    <Input type="email" placeholder="Enter your email address" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#212529] mb-1">Subject</label>
                    <Input type="text" placeholder="What can we help you with?" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#212529] mb-1">Message</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Describe your issue or question..."
                    />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 