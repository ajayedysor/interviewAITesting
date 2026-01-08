import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interviewId, status, endedAt } = body;

    if (!interviewId) {
      return NextResponse.json({ error: 'Interview ID is required' }, { status: 400 });
    }

    // Update interview status
    const updateData: any = { status };
    if (endedAt) {
      updateData.endedAt = endedAt;
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('Interview')
      .update(updateData)
      .eq('id', interviewId)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update interview status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, interview: data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 