import { S3Client } from "@aws-sdk/client-s3"

// Global S3 client instance with connection pooling
let s3Client: S3Client | null = null

export function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
      },
      // Optimize for serverless environments
      maxAttempts: 3,
      requestHandler: {
        // Reduce timeout for faster failure detection
        requestTimeout: 10000, // 10 seconds
      }
    })
  }
  
  return s3Client
}

// Cleanup function for serverless environments
export function cleanupS3Client() {
  if (s3Client) {
    s3Client.destroy()
    s3Client = null
  }
} 