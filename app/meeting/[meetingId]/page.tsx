'use client'
import React, { useEffect, useState } from 'react';
import { MeetingPreview } from "@/components/meeting-preview";
import { createClient } from '@supabase/supabase-js';
import Link from "next/link";

export default function MeetingPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = React.use(params);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get data from sessionStorage first (primary data source)
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('meetingPreviewData') : null;
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data && data.interview && data.interview.id === meetingId) {

          
          // Ensure user object has userSummary property for InterviewRoom compatibility
          const enhancedData = {
            ...data,
            user: data.user ? {
              ...data.user,
              userSummary: data.user.userSummary || "" // Add userSummary if missing
            } : null
          };
          

          
          setPreviewData(enhancedData);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error parsing sessionStorage data:', error);
      }
    }
    
    // Fallback: fetch from Supabase only if sessionStorage data is not available
    (async () => {
      setLoading(true);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      try {
        const { data: interview, error } = await supabase
          .from('Interview')
          .select('*')
          .eq('id', meetingId)
          .single();
          
        if (error || !interview) {
          setPreviewData(null);
          setLoading(false);
          return;
        }

        // Fetch related data
        let university = null;
        if (interview.universityId) {
          const { data: universityData } = await supabase
            .from('universities')
            .select('*')
            .eq('id', interview.universityId)
            .single();
          university = universityData;
        }

        let interviewer = null;
        if (interview.interviewerId) {
          const { data: interviewerData } = await supabase
            .from('Interviewer')
            .select('*')
            .eq('id', interview.interviewerId)
            .single();
          interviewer = interviewerData;
        }

        let user = null;
        if (interview.userId) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', interview.userId)
            .single();
          user = userData ? {
            ...userData,
            userSummary: userData.userSummary || "" // Ensure userSummary exists
          } : null;
        }

        setPreviewData({ interview, university, interviewer, user });
      } catch (error) {
        console.error('Error fetching meeting data:', error);
        setPreviewData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [meetingId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading meeting...</div>;
  }
  
  if (!previewData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">No meeting found</h2>
        <Link href="/dashboard" className="text-blue-600 underline">Go back to dashboard</Link>
      </div>
    );
  }
  
  return (
    <MeetingPreview 
      meetingId={meetingId} 
      university={previewData.university} 
      interviewer={previewData.interviewer} 
      user={previewData.user} 
      interview={previewData.interview} 
    />
  );
}
