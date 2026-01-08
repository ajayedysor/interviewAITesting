import { NextResponse } from "next/server";

// PRESERVED VAPI CODE (Disabled)
/*
export async function GET() {
  const publicKey = process.env.VAPI_PUBLIC_KEY
  const assistantId = process.env.VAPI_ASSISTANT_ID

  if (!publicKey || !assistantId) {
    return NextResponse.json(
      { error: "Vapi configuration missing" }
    )
  }

  return NextResponse.json({
    publicKey,
    assistantId,
  })
}
*/

export async function GET() {
  return NextResponse.json({ message: "Vapi is disabled" }, { status: 404 });
}
