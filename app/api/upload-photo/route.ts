import { NextResponse } from "next/server"
import { PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3"
import { getS3Client } from "@/lib/s3"
import { getSupabaseClient } from "@/lib/supabase"
import { rateLimit } from "@/lib/rate-limit"

// Remove edge runtime to fix AWS SDK compatibility issues
// export const runtime = "edge"

export async function POST(req: Request) {
  // Apply rate limiting (5 uploads per minute per IP)
  const rateLimitResult = rateLimit(100, 60000)(req)
  if (rateLimitResult) {
    return rateLimitResult
  }
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const interviewId = formData.get("interviewId") as string | null
    const uploadType = formData.get("uploadType") as string | null
    const title = formData.get("title") as string | null
    const violation = formData.get("violation") as string | null
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileName = file.name
    const bucket = process.env.AWS_S3_BUCKET!
    const region = process.env.AWS_S3_REGION!
    
    // Get optimized S3 client
    const s3 = getS3Client()
    
    const uploadParams = {
      Bucket: bucket,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ACL: ObjectCannedACL.private,
    }
    
    await s3.send(new PutObjectCommand(uploadParams))
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`
    
    // Insert into Uploads table if interviewId is provided
    if (interviewId) {
      try {
        const data = {
          title: title || "Random Photo Taken",
          evidence: {
            evidenceURL: url
          },
          violation: violation === "true",
          capturedAt: new Date().toISOString()
        }
        
        // Get optimized Supabase client
        const supabase = getSupabaseClient()
        
        const { error: dbError } = await supabase
          .from('Uploads')
          .insert({
            identifier: interviewId,
            "identifierType": "interviewId",
            "uploadType": uploadType || "evidence",
            bucket: bucket,
            region: region,
            path: fileName,
            url: url,
            data: data
          })
        
        if (dbError) {
          console.error("Failed to insert into Uploads table:", dbError)
          // Don't fail the upload if DB insert fails
        } else {
          // Successfully inserted into Uploads table
        }
      } catch (dbError) {
        console.error("Error inserting into Uploads table:", dbError)
        // Don't fail the upload if DB insert fails
      }
    }
    
    return NextResponse.json({ success: true, url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 })
  }
}
