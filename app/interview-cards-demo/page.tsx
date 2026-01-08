"use client";

import { InterviewCard } from "@/components/interview-card";
import { useRouter } from "next/navigation";

// Sample data for demonstration
const sampleInterviews = [
  {
    id: "1",
    title: "Computer Science Interview",
    callId: "call_123456",
    startedAt: "2024-01-15T10:00:00Z",
    endedAt: "2024-01-15T11:30:00Z",
    status: "COMPLETED",
    result: "PASSED",
    resultUrl: "https://example.com/results/1",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-15T11:30:00Z",
    interviewerId: "int_1",
    expiryDate: "2024-02-15T23:59:59Z",
    procterReport: {
      // faceDetection: "Active throughout interview",
      tabSwitches: 2,
      audioQuality: "Good",
      violations: []
    },
    evidence: [
      { type: "screenshot", timestamp: "2024-01-15T10:15:00Z" },
      { type: "audio", timestamp: "2024-01-15T10:00:00Z" }
    ],
    score: 8.5,
    evaluationReport: "Excellent technical knowledge demonstrated...",
    proctoringReport: "No violations detected during the interview",
    course: "Computer Science",
    universityId: "uni_1",
    universities: {
      id: "uni_1",
      name: "University of Oxford",
      logo_url: null,
      question_bank: "https://example.com/question-bank/oxford-cs"
    },
    interviewers: {
      id: "int_1",
      name: "Dr. Sarah Johnson",
      avatarUrl: null
    }
  },
  {
    id: "2",
    title: "Engineering Interview",
    callId: "call_123457",
    startedAt: null,
    endedAt: null,
    status: "PENDING",
    result: "PENDING",
    resultUrl: null,
    createdAt: "2024-01-12T14:00:00Z",
    updatedAt: "2024-01-12T14:00:00Z",
    interviewerId: "int_2",
    expiryDate: "2024-02-12T23:59:59Z",
    procterReport: {},
    evidence: [],
    score: null,
    evaluationReport: null,
    proctoringReport: null,
    course: "Mechanical Engineering",
    universityId: "uni_2",
    universities: {
      id: "uni_2",
      name: "University of Cambridge",
      logo_url: null,
      question_bank: "https://example.com/question-bank/cambridge-engineering"
    },
    interviewers: {
      id: "int_2",
      name: "Prof. Michael Chen",
      avatarUrl: null
    }
  },
  {
    id: "3",
    title: "Data Science Interview",
    callId: "call_123458",
    startedAt: "2024-01-08T15:00:00Z",
    endedAt: "2024-01-08T16:45:00Z",
    status: "COMPLETED",
    result: "FAILED",
    resultUrl: "https://example.com/results/3",
    createdAt: "2024-01-05T11:00:00Z",
    updatedAt: "2024-01-08T16:45:00Z",
    interviewerId: "int_3",
    expiryDate: "2024-02-05T23:59:59Z",
    procterReport: {
      // faceDetection: "Intermittent",
      tabSwitches: 8,
      audioQuality: "Poor",
      violations: ["Multiple tab switches detected"]
    },
    evidence: [
      { type: "screenshot", timestamp: "2024-01-08T15:30:00Z" },
      { type: "audio", timestamp: "2024-01-08T15:00:00Z" }
    ],
    score: 4.2,
    evaluationReport: "Candidate struggled with advanced concepts...",
    proctoringReport: "Multiple violations detected during the interview",
    course: "Data Science",
    universityId: "uni_3",
    universities: {
      id: "uni_3",
      name: "Imperial College London",
      logo_url: null,
      question_bank: "https://example.com/question-bank/imperial-datascience"
    },
    interviewers: {
      id: "int_3",
      name: "Dr. Emily Rodriguez",
      avatarUrl: null
    }
  },
  {
    id: "4",
    title: "AI & Machine Learning Interview",
    callId: "call_123459",
    startedAt: "2024-01-20T13:00:00Z",
    endedAt: null,
    status: "IN_PROGRESS",
    result: "PENDING",
    resultUrl: null,
    createdAt: "2024-01-18T10:00:00Z",
    updatedAt: "2024-01-20T13:00:00Z",
    interviewerId: "int_4",
    expiryDate: "2024-02-18T23:59:59Z",
    procterReport: {
      // faceDetection: "Active",
      tabSwitches: 0,
      audioQuality: "Excellent",
      violations: []
    },
    evidence: [
      { type: "screenshot", timestamp: "2024-01-20T13:15:00Z" },
      { type: "audio", timestamp: "2024-01-20T13:00:00Z" }
    ],
    score: null,
    evaluationReport: null,
    proctoringReport: null,
    course: "AI & Machine Learning",
    universityId: "uni_4",
    universities: {
      id: "uni_4",
      name: "University of Edinburgh",
      logo_url: null,
      question_bank: "https://example.com/question-bank/edinburgh-ai"
    },
    interviewers: {
      id: "int_4",
      name: "Prof. David Thompson",
      avatarUrl: null
    }
  }
];

export default function InterviewCardsDemo() {
  const router = useRouter();

  const handleJoinInterview = (interviewId: string) => {
    // Navigate to the interview room
    router.push(`/meeting/${interviewId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">

        <div className="space-y-6">
          {sampleInterviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onJoinInterview={handleJoinInterview}
            />
          ))}
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Component Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Visual Elements</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• University logo/initial display</li>
                <li>• Status badges with color coding</li>
                <li>• Result badges (PASSED/FAILED)</li>
                <li>• Expandable details section</li>
                <li>• Action buttons (Join Interview, View Results)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Data Display</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Interview title and course</li>
                <li>• University and interviewer information</li>
                <li>• Timestamps and duration</li>
                <li>• Score and evaluation details</li>
                <li>• Proctoring reports and evidence</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 