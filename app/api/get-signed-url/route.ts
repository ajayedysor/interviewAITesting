import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

const AGENT_ID = process.env.ELEVENLABS_AGENT_ID || "agent_9401kc3bnj8sfkys4vmqdrghmxdm";

export async function GET() {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: "ELEVENLABS_API_KEY is missing" }, { status: 500 });
    }

    const eleven = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    const signedUrl = await eleven.conversationalAi.getSignedUrl({
      agent_id: AGENT_ID,
    });

    return NextResponse.json({ signed_url: signedUrl.signed_url });
  } catch (err: any) {
    console.error("Error getting signed URL:", err);
    return NextResponse.json({ error: err.message || "Failed to get signed URL" }, { status: 500 });
  }
}

