import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json(
      { error: "ElevenLabs configuration missing" },
      { status: 500 }
    );
  }

  try {
    const client = new ElevenLabsClient({
      apiKey: apiKey,
    });

    const response = await client.conversationalAi.getSignedUrl({
      agent_id: agentId,
    });

    // Handle cases where response might be an object or a string
    const signedUrl = typeof response === "string" ? response : (response as any).signed_url;

    return NextResponse.json({
      signed_url: signedUrl,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
