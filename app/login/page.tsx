"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRive } from "@rive-app/react-canvas";
import { createClient } from '@supabase/supabase-js';
import { useRef } from "react";
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function SquareDotsLoader() {
  return (
    <span className="flex items-center justify-center gap-0.5 w-full">
      <span className="w-2 h-2 bg-white animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-2 h-2 bg-white animate-bounce [animation-delay:0s]"></span>
      <span className="w-2 h-2 bg-white animate-bounce [animation-delay:0.2s]"></span>
    </span>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [userName, setUserName] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [offerLetter, setOfferLetter] = useState<File | null>(null);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const fileInputResume = useRef<HTMLInputElement>(null);
  const fileInputOffer = useRef<HTMLInputElement>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResumeDragOver, setIsResumeDragOver] = useState(false);
  const [isOfferDragOver, setIsOfferDragOver] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    setSuccess(false);
    try {
      // Fetch user by email
      const { data, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      if (dbError || !data) {
        setError('No user found with this email.');
        setLoading(false);
        console.error('Supabase error:', dbError);
        return;
      }
      // Directly compare password (plain text)
      if (password !== data.passwordHash) {
        setError('Incorrect password.');
        setLoading(false);
        return;
      }
      setUserName(data.name || "");
      setSuccess(true);
      setLoading(false);
      
      // Store user ID for later use in onboarding
      const extractedUserId = data.id;
      setUserId(extractedUserId);
      setSession(extractedUserId);
      // Store user info for dashboard display
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionUser', JSON.stringify({ name: data.name, email: data.email }));
      }
      
      // Always redirect to dashboard, bypassing onboarding docs check
      router.push('/');
    } catch (err: any) {
      setError('Login failed. ' + (err.message || 'Please try again.'));
      setLoading(false);
      console.error('Login error:', err);
    }
  };

  const setSession = (userId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sessionUserId', userId);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(false);
    
    if (!resetEmail) {
      setResetError("Please enter your email address.");
      setResetLoading(false);
      return;
    }

    try {
      const response = await fetch("https://hook.eu2.make.com/uyytvt2m8witqr76mx4l15e4r3rltzvw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      
      if (response.ok) {
        setResetSuccess(true);
        setResetError(null);
      } else {
        throw new Error("No user found with this email.");
      }
    } catch (err: any) {
      setResetError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  // Onboarding Handlers
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setResume(file);
      setOnboardingError(null);
    } else if (file) {
      setOnboardingError("Resume must be a PDF file.");
    }
  };

  const handleResumeDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResumeDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setResume(file);
      setOnboardingError(null);
    } else if (file) {
      setOnboardingError("Resume must be a PDF file.");
    }
  };

  const handleResumeDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResumeDragOver(true);
  };

  const handleResumeDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResumeDragOver(true);
  };

  const handleResumeDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResumeDragOver(false);
  };
  // Function to generate unique file name
  const generateUniqueFileName = (originalName: string, fileType: string) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    return `${fileType}_${timestamp}_${randomString}.${extension}`;
  };

  const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setOfferLetter(file);
      setOnboardingError(null);
    } else if (file) {
      setOnboardingError("Offer letter must be a PDF file.");
    }
  };

  const handleOfferDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOfferDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setOfferLetter(file);
      setOnboardingError(null);
    } else if (file) {
      setOnboardingError("Offer letter must be a PDF file.");
    }
  };

  const handleOfferDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOfferDragOver(true);
  };

  const handleOfferDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOfferDragOver(true);
  };

  const handleOfferDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOfferDragOver(false);
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

  const handleOnboardingContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardingError(null);
    setLoading(true);
    if (!resume) {
      setOnboardingError("Resume is required.");
      setLoading(false);
      return;
    }
    try {
      // Helper to upload a file to /api/upload-photo and get the URL
      const uploadFile = async (file: File, fileType: string) => {
        const formData = new FormData();
        // Create a new file with unique name for AWS upload
        const uniqueFileName = generateUniqueFileName(file.name, fileType);
        const fileWithUniqueName = new File([file], uniqueFileName, { type: file.type });
        formData.append("file", fileWithUniqueName);
        const res = await fetch("/api/upload-photo", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to upload file");
        const data = await res.json();
        if (!data.url) throw new Error("No URL returned from upload");
        return data.url;
      };
      // Upload resume
      const resumeUrl = await uploadFile(resume, "resume");
      const docsArr = [
        { url: resumeUrl, name: "cv/resume", status: "uploaded" }
      ];
      // Upload offer letter if present
      if (offerLetter) {
        const offerUrl = await uploadFile(offerLetter, "offer");
        docsArr.push({ url: offerUrl, name: "offer-letter", status: "uploaded" });
      }
      // Update user in Supabase (using email as identifier)
      const { error: updateError } = await supabase
        .from('users')
        .update({ docs: docsArr, resumeUrl: resumeUrl })
        .eq('email', email);
      if (updateError) throw new Error("Failed to update user docs");
      
      // Call external webhook with userId
      if (userId) {
        const webhookResponse = await fetch("https://hook.eu2.make.com/otekpj2iwabp58ttqa5o7h8fnw65179w", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        
        if (!webhookResponse.ok) {
          throw new Error("Webhook call failed");
        }
      }
      setOnboardingError(null);
      setLoading(false);
      // Redirect to main page
      router.push('/');
    } catch (err: any) {
      setOnboardingError(err.message || "Onboarding failed. Try again.");
      setLoading(false);
    }
  };

  const { RiveComponent } = useRive({
    src: "/happy_meeple.riv",
    autoplay: true,
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f6f6f6]">
      {/* Left Side */}
      <div className="flex flex-col justify-between w-full md:max-w-xl py-8 md:py-10 bg-[#f6f6f6] min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-6 md:px-12">
          <span className="text-2xl font-semibold tracking-tight text-left">Muskan.ai</span>
          {/* Favicon */}
          <img 
            src="/favicon.png" 
            alt="Muskan.ai" 
            className="w-7 h-7 rounded-lg"
          />
        </div>
        {/* Center Content: Login or Onboarding, with slide animation */}
        <div className="relative flex-1 flex flex-col justify-center items-center w-full overflow-x-hidden min-h-0">
          <div className={`absolute top-0 left-0 w-full transition-transform duration-500 ${onboarding || forgotPassword ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"}`} style={{zIndex: onboarding || forgotPassword ? 0 : 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%'}}>
            <div className="px-6 md:px-12 w-full">
              {/* Login Form */}
              <h1 className="text-3xl font-bold mb-8 text-left w-full">Login</h1>
              <form className="flex flex-col gap-6" onSubmit={handleLogin}>
            <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 tracking-widest">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-4 py-4 rounded-md bg-[#ededed] text-gray-900 text-base outline-none focus:ring-2 focus:ring-black placeholder-gray-400 text-lg"
                    autoComplete="email"
                required
              />
            </div>
            <div className="relative">
                  <label className="block text-xs font-semibold text-gray-600 mb-2 tracking-widest">PASSWORD</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-4 rounded-md bg-[#ededed] text-gray-900 text-base outline-none focus:ring-2 focus:ring-black placeholder-gray-400 text-lg"
                    autoComplete="current-password"
                required
              />
                </div>
                {/* Show/Hide Password Toggle Below Password Field */}
              <button
                type="button"
                  className="flex items-center gap-1 text-gray-600 hover:text-black text-sm mt-[-12px] mb-2 w-fit"
                onClick={() => setShowPassword(v => !v)}
                  tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                    <>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5 0-9-4-9-7s4-7 9-7c1.13 0 2.21.19 3.22.54" /><path d="M17.94 17.94A9.97 9.97 0 0 1 12 19c-5 0-9-4-9-7 0-1.61.62-3.09 1.66-4.24M1 1l22 22" /></svg>
                      Hide password
                    </>
                ) : (
                    <>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M2.05 12C3.81 7.61 7.86 4.5 12 4.5c4.14 0 8.19 3.11 9.95 7.5-1.76 4.39-5.81 7.5-9.95 7.5-4.14 0-8.19-3.11-9.95-7.5z" /></svg>
                      Show password
                    </>
                )}
              </button>
                <button
                  type="submit"
                  className="w-full h-12 bg-black text-white rounded-lg text-lg font-bold mt-2 transition hover:bg-[#181818] shadow-sm flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? <SquareDotsLoader /> : "Continue"}
                </button>
              </form>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
              {/* Remove info message from render */}
              <div className="mt-4">
                <button 
                  type="button"
                  onClick={() => setForgotPassword(true)}
                  className="block text-center text-black underline underline-offset-2 hover:text-gray-700 text-base font-medium w-full"
                >
                  Forgot password?
                </button>
              </div>
            </div>
          </div>
          <div className={`absolute top-0 left-0 w-full transition-transform duration-500 ${forgotPassword ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}`} style={{zIndex: forgotPassword ? 1 : 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%'}}>
            <div className="px-6 md:px-12 w-full">
              {/* Forgot Password Form */}
              <h1 className="text-3xl font-bold mb-2 text-left w-full">Reset Password</h1>
              <p className="text-gray-700 text-base mb-6 w-full">Enter your email address and we'll send you a link to reset your password.</p>
              <form className="flex flex-col gap-6 w-full" onSubmit={handleForgotPassword}>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 tracking-widest">EMAIL</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-4 rounded-md bg-[#ededed] text-gray-900 text-base outline-none focus:ring-2 focus:ring-black placeholder-gray-400 text-lg"
                    autoComplete="email"
                    required
                  />
                </div>
                {resetError && <div className="text-red-500 text-sm">{resetError}</div>}
                {resetSuccess && <div className="text-green-500 text-sm">Password reset email sent successfully!</div>}
                <button 
                  type="submit" 
                  className="w-full h-12 bg-black text-white rounded-lg text-lg font-bold mt-2 transition hover:bg-[#181818] shadow-sm flex items-center justify-center" 
                  disabled={resetLoading}
                >
                  {resetLoading ? <SquareDotsLoader /> : "Reset Password"}
                </button>
                <button 
                  type="button"
                  onClick={() => setForgotPassword(false)}
                  className="w-full text-center text-black underline underline-offset-2 hover:text-gray-700 text-base font-medium"
                >
                  Back to Login
                </button>
              </form>
            </div>
          </div>
          <div className={`absolute top-0 left-0 w-full transition-transform duration-500 ${onboarding ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}`} style={{zIndex: onboarding ? 1 : 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%'}}>
            <div className="px-6 md:px-12 w-full">
              {/* Onboarding Form */}
              <h1 className="text-3xl font-bold mb-2 text-left w-full">Welcome, {userName || "User"}!</h1>
              <p className="text-gray-700 text-base mb-4 w-full">To move forward, we need these documents from you.</p>
              <form className="flex flex-col gap-6 w-full" onSubmit={handleOnboardingContinue}>
                {/* Resume Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 tracking-widest">RESUME (PDF) <span className="text-[#8B0000]">*</span></label>
                  <div 
                    className={`w-full px-4 py-4 rounded-md text-gray-900 text-base outline-none focus:ring-2 focus:ring-black placeholder-gray-400 text-lg flex items-center cursor-pointer border border-dashed transition-all duration-200 ${
                      isResumeDragOver || isDraggingFile
                        ? 'bg-blue-50 border-blue-400 border-2' 
                        : 'bg-[#ededed] border-gray-300 hover:border-black'
                    }`}
                    onClick={() => fileInputResume.current?.click()}
                    onDrop={handleResumeDrop}
                    onDragOver={handleResumeDragOver}
                    onDragEnter={handleResumeDragEnter}
                    onDragLeave={handleResumeDragLeave}
                  >
                    <span className="flex-1 truncate">
                      {isResumeDragOver || isDraggingFile
                        ? "Drop your resume here (PDF)" 
                        : resume ? resume.name : "Click or drag to upload your resume (PDF)"
                      }
                    </span>
                    <input type="file" accept="application/pdf" className="hidden" ref={fileInputResume} onChange={handleResumeChange} />
                  </div>
                </div>
                {/* Offer Letter Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 tracking-widest">OFFER LETTER (PDF)</label>
                  <div 
                    className={`w-full px-4 py-4 rounded-md text-gray-900 text-base outline-none focus:ring-2 focus:ring-black placeholder-gray-400 text-lg flex items-center cursor-pointer border border-dashed transition-all duration-200 ${
                      isOfferDragOver || isDraggingFile
                        ? 'bg-blue-50 border-blue-400 border-2' 
                        : 'bg-[#ededed] border-gray-300 hover:border-black'
                    }`}
                    onClick={() => fileInputOffer.current?.click()}
                    onDrop={handleOfferDrop}
                    onDragOver={handleOfferDragOver}
                    onDragEnter={handleOfferDragEnter}
                    onDragLeave={handleOfferDragLeave}
                  >
                    <span className="flex-1 truncate">
                      {isOfferDragOver || isDraggingFile
                        ? "Drop your offer letter here (PDF)" 
                        : offerLetter ? offerLetter.name : "Click or drag to upload your offer letter (PDF)"
                      }
                    </span>
                    <input type="file" accept="application/pdf" className="hidden" ref={fileInputOffer} onChange={handleOfferChange} />
                  </div>
                </div>
                {onboardingError && <div className="text-red-500 text-sm mt-2">{onboardingError}</div>}
                <button type="submit" className="w-full h-12 bg-black text-white rounded-lg text-lg font-bold mt-2 transition hover:bg-[#181818] shadow-sm flex items-center justify-center" disabled={loading}>{loading ? <SquareDotsLoader /> : "Continue"}</button>
              </form>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="text-xs font-mono text-gray-500 mt-12 text-left px-6 md:px-12">©2025 MUSKAN.AI. ALL RIGHTS RESERVED.</div>
      </div>
      {/* Right Side (Testimonial) */}
      <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden min-h-[320px] md:min-h-screen px-4 py-8 md:p-0">
        {/* Noise/gradient background effect */}
        <div className="absolute inset-0 z-0" style={{background: 'radial-gradient(ellipse at 70% 80%, #ff4d00 0%, transparent 40%), radial-gradient(ellipse at 50% 50%, #222 60%, #111 100%)', opacity: 0.7}} />
        {/* Testimonial Card */}
        <div className="relative z-10 rounded-xl p-6 md:p-8 max-w-md w-full text-white shadow-lg flex flex-col gap-6 bg-black/40 backdrop-blur-md border border-white/10">
          <div className="text-lg leading-relaxed">
            "As a student, I found Muskan.ai to be a game changer! The intuitive interface, real-time feedback, and personalized learning paths made my preparation so much more effective and enjoyable. No other platform supports students like Muskan.ai does. Highly recommended!"
          </div>
          <div className="flex items-center gap-3 mt-2">
            {/* Student profile image */}
            <img
              src="https://img.freepik.com/free-photo/close-up-shot-beautiful-young-brunette-woman-dressed-striped-top-relaxing-plant-nursery-daytime-enjoying-fresh-air-people-nature-greenery-agriculture-gardening-freshness-concept_343059-209.jpg?semt=ais_hybrid&w=740"
              alt="Priya Sharma profile"
              className="w-10 h-10 rounded-full object-cover border border-white/30 shadow"
            />
            <div>
              <div className="font-semibold text-sm">PRIYA SHARMA</div>
              <div className="text-xs text-gray-200">STUDENT, MUSKAN.AI USER</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
