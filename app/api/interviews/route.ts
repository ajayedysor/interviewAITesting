import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch interviews for the specific user
    const { data: interviews, error } = await supabase
      .from('Interview')
      .select(`
        id,
        title,
        status,
        result,
        score,
        course,
        "startedAt",
        "endedAt",
        "createdAt",
        "updatedAt",
        "expiryDate",
        "resultUrl",
        "evaluationReport",
        "proctoringReport",
        "procterReport",
        evidence,
        universities:universityId (
          id,
          name,
          logo_url,
          question_bank,
          questions
        ),
        interviewers:interviewerId (
          id,
          name,
          avatarUrl
        )
      `)
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 });
    }

    return NextResponse.json({ interviews: interviews || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 