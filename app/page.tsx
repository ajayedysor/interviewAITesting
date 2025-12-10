"use client";

import { useState } from "react";
import MeetingPreview from "@/components/MeetingPreview";
import InterviewRoom from "@/components/InterviewRoom";

type AppState = "landing" | "preview" | "interview" | "completed";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing");

  // Landing Page
  if (appState === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-500/10 to-transparent rounded-full" />
          
          {/* Animated Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              AI Interview
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Practice Bot
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-slate-400 text-center max-w-xl mb-12">
            Practice your interview skills with an AI-powered interviewer. 
            Get real-time feedback on your responses and body language.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Real-time Voice AI</h3>
              <p className="text-slate-400 text-sm">Natural conversation with ElevenLabs AI interviewer</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Face Detection</h3>
              <p className="text-slate-400 text-sm">MediaPipe-powered monitoring for eye contact & attention</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Real-time Feedback</h3>
              <p className="text-slate-400 text-sm">Get alerts when you look away or lose focus</p>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={() => setAppState("preview")}
            className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg rounded-2xl shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-3">
              <span>Start Practice Interview</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          {/* Footer */}
          <p className="mt-12 text-slate-500 text-sm">
            Powered by ElevenLabs Conversational AI & MediaPipe
          </p>
        </div>
      </div>
    );
  }

  // Meeting Preview
  if (appState === "preview") {
    return <MeetingPreview onStartInterview={() => setAppState("interview")} />;
  }

  // Interview Room
  if (appState === "interview") {
    return <InterviewRoom onEndInterview={() => setAppState("completed")} />;
  }

  // Completed State
  if (appState === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">Interview Complete!</h1>
          <p className="text-slate-400 mb-8 max-w-md">
            Thank you for completing your practice interview. Review your performance and try again to improve.
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setAppState("landing")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition border border-white/10"
            >
              Back to Home
            </button>
            <button
              onClick={() => setAppState("preview")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
