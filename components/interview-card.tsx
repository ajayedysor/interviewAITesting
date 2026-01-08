"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  GraduationCap,
  MapPin,
  User,
  Award,
  FileText,
  ExternalLink,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Target,
  Eye,
  AlertTriangle,
} from "lucide-react";

interface University {
  id: string;
  name: string;
  logo_url: string | null;
  question_bank: string | null;
}

interface Interviewer {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface Interview {
  id: string;
  title: string;
  callId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  status: string;
  result: string;
  resultUrl: string | null;
  createdAt: string;
  updatedAt: string;
  interviewerId: string | null;
  expiryDate: string | null;
  procterReport: any;
  evidence: any[] | null;
  score: number | null;
  evaluationReport: string | null;
  proctoringReport: string | null;
  course: string | null;
  universityId: string | null;
  universities?: University;
  interviewers?: Interviewer;
}

interface InterviewCardProps {
  interview: Interview;
  onJoinInterview?: (interviewId: string) => void;
  interviewNumber?: number;
  passportNumber?: string | null;
}

export function InterviewCard({ interview, onJoinInterview, interviewNumber, passportNumber }: InterviewCardProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResultColor = (result: string) => {
    switch (result.toLowerCase()) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Play className="w-4 h-4" />;
      case 'pending':
        return <Timer className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (startedAt: string | null, endedAt: string | null) => {
    if (!startedAt || !endedAt) return 'N/A';
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60); // minutes
    return `${duration} min`;
  };

  const handleJoinInterview = () => {
    setShowInstructions(true);
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
  };

  const handleContinueToInterview = () => {
    setShowInstructions(false);
    if (onJoinInterview) {
      onJoinInterview(interview.id);
    }
  };

  const canJoinInterview = interview.status === 'PENDING' || interview.status === 'IN_PROGRESS';

  return (
    <>
      <Card className="w-full border-0 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Interview Number Circle */}
            <div className="w-12 h-12 rounded-full bg-[#ececec] flex items-center justify-center text-[#222] font-bold text-lg">
              {interviewNumber || '#'}
            </div>
            
            {/* Interview Info */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                {interview.title}
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {interview.course && (
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>{interview.course}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center space-x-2">
            {/* Show PASS/FAIL for completed interviews with scores, otherwise show status */}
            {interview.status === 'COMPLETED' && interview.score !== null ? (
              <Badge 
                variant="outline" 
                className={`${interview.score >= 7 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} flex items-center space-x-1`}
              >
                {interview.score >= 7 ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span className="capitalize">{interview.score >= 7 ? 'PASS' : 'FAIL'}</span>
              </Badge>
            ) : (
              <Badge variant="outline" className={`${getStatusColor(interview.status)} flex items-center space-x-1`}>
                {getStatusIcon(interview.status)}
                <span className="capitalize">{interview.status.replace('_', ' ')}</span>
              </Badge>
            )}
            
            {interview.result !== 'PENDING' && interview.status !== 'COMPLETED' && (
              <Badge className={`${getResultColor(interview.result)} hover:no-underline hover:bg-opacity-100`}>
                {interview.result.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Key Details Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-center pt-4">
          {interview.status === 'COMPLETED' ? (
            <>
              {/* Score - First for completed interviews */}
              <div className="flex flex-col items-center text-sm">
                <Award className="w-4 h-4 text-gray-500 mb-1" />
                <div>
                  <div className="font-medium text-gray-900">Score</div>
                  <div className="text-gray-600">
                    {interview.score !== null ? `${interview.score}/10` : 'Not available'}
                  </div>
                </div>
              </div>

              {/* Duration - Show for completed interviews */}
              <div className="flex flex-col items-center text-sm">
                <Clock className="w-4 h-4 text-gray-500 mb-1" />
                <div>
                  <div className="font-medium text-gray-900">Duration</div>
                  <div className="text-gray-600">
                    {interview.startedAt && interview.endedAt ? formatDuration(interview.startedAt, interview.endedAt) : '-'}
                  </div>
                </div>
              </div>

              {/* Completed Date - Last for completed interviews */}
              <div className="flex flex-col items-center text-sm">
                <CheckCircle className="w-4 h-4 text-gray-500 mb-1" />
                <div>
                  <div className="font-medium text-gray-900">Completed</div>
                  <div className="text-gray-600">{formatDateOnly(interview.endedAt)}</div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Passing Marks - First for non-completed interviews */}
              <div className="flex flex-col items-center text-sm">
                <Target className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Passing Marks</div>
                  <div className="text-gray-600">7/10</div>
                </div>
              </div>

              {/* Interviewer - Second for non-completed interviews */}
              <div className="flex flex-col items-center text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Interviewer</div>
                  <div className="text-gray-600">{interview.interviewers?.name || 'N/A'}</div>
                </div>
              </div>

              {/* Expiry Date - Third for non-completed interviews */}
              <div className="flex flex-col items-center text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Expires</div>
                  <div className="text-gray-600">{formatDateOnly(interview.expiryDate)}</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider line between details and actions */}
        <hr className="mt-4 mb-0 border-gray-200" style={{ opacity: 0.6 }} />

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 pt-3">
          {/* Join Interview Button for Non-Completed Interviews */}
          {interview.status !== 'COMPLETED' && canJoinInterview && onJoinInterview && (
            <Button 
              onClick={handleJoinInterview}
              className="w-full bg-[#212529] hover:bg-[#495057] text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Join Interview
            </Button>
          )}
          
          {/* View Results Button */}
          {interview.resultUrl && (
            <Button variant="outline" asChild className="w-full">
              <a href={interview.resultUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="w-4 h-4 mr-2" />
                View Results
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          )}

          {/* Report Buttons for Completed Interviews */}
          {interview.status === 'COMPLETED' && (
            <div className="grid grid-cols-2 gap-2 w-full">
              {interview.evaluationReport && (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <a href={interview.evaluationReport} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4 mr-2" />
                    View Evaluation
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}
              {interview.proctoringReport && (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <a href={interview.proctoringReport} target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    Proctoring Report
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}
              {/* Show message when no evaluation report is available */}
              {!interview.evaluationReport && !interview.proctoringReport && (
                <div className="text-sm text-gray-500 italic text-center w-full py-2 col-span-2">
                  You will find your results here, shortly!
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Important Instructions Modal */}
    {showInstructions && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
                        <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
                onClick={handleCloseInstructions}
                aria-label="Close"
              >
                ×
              </button>
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Important Instructions</h2>
          </div>
                      <ol className="list-decimal list-inside text-gray-800 space-y-2 mb-6 text-base">
              <li>You will be asked questions similar to real university and visa interviews.</li>
              <li>Some questions will be based on your profile and documents.</li>
              <li>You may be asked about:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-sm">
                  <li>Personal and academic background</li>
                  <li>Work experience (if any)</li>
                  <li>Passport and financial details</li>
                  <li>Why you chose the country, university, and course</li>
                  <li>Simple questions to check your English and understanding</li>
                </ul>
              </li>
              <li>Sit calmly and avoid unnecessary movement while answering. The system will continuously capture your images for monitoring and verification purposes.</li>
              <li>You will get 3 warnings. If you continue to break the rules, your interview may be ended.</li>
            </ol>

            <button
              className={`w-full py-3 rounded-full text-base font-semibold transition-colors duration-200 bg-blue-600 text-white hover:bg-blue-700`}
              onClick={handleContinueToInterview}
            >
              Continue to Interview
            </button>
        </div>
      </div>
    )}
  </>
  );
} 