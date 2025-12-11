import { NextRequest, NextResponse } from "next/server";

// POST /api/webhook - Receives data from ElevenLabs when conversation ends
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Log the webhook data (you can see this in Vercel logs)
    console.log("📥 Webhook received from ElevenLabs:");
    console.log("Conversation ID:", data.conversation_id);
    console.log("Agent ID:", data.agent_id);
    console.log("Status:", data.status);
    console.log("Duration:", data.call_duration_secs, "seconds");
    console.log("Transcript:", JSON.stringify(data.transcript, null, 2));
    console.log("Summary:", data.summary);
    console.log("Full data:", JSON.stringify(data, null, 2));

    // TODO: Save to database here
    // Example:
    // await db.interviews.create({
    //   conversationId: data.conversation_id,
    //   transcript: data.transcript,
    //   summary: data.summary,
    //   duration: data.call_duration_secs,
    // });

    // Return success response to ElevenLabs
    return NextResponse.json({ 
      success: true, 
      message: "Webhook received",
      conversation_id: data.conversation_id 
    });

  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json(
      { error: err.message || "Webhook processing failed" }, 
      { status: 500 }
    );
  }
}

// Optional: Handle GET for testing if endpoint exists
export async function GET() {
  return NextResponse.json({ 
    status: "Webhook endpoint is active",
    method: "Send POST request with data" 
  });
}