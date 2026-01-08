// Simple rate limiting for serverless environments
interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  isAllowed(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return true
    }

    if (entry.count >= maxRequests) {
      return false
    }

    entry.count++
    return true
  }

  getRemaining(key: string): number {
    const entry = this.limits.get(key)
    if (!entry || Date.now() > entry.resetTime) {
      return 10 // Default limit
    }
    return Math.max(0, 10 - entry.count)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.limits.clear()
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter()

// Rate limiting middleware
export function rateLimit(maxRequests: number = 10, windowMs: number = 60000) {
  return function(req: Request) {
    // Use IP or user ID as key (simplified for demo)
    const key = req.headers.get('x-forwarded-for') || 
                req.headers.get('x-real-ip') || 
                'unknown'
    
    if (!rateLimiter.isAllowed(key, maxRequests, windowMs)) {
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded',
        remaining: 0,
        resetTime: Date.now() + windowMs
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (Date.now() + windowMs).toString()
        }
      })
    }

    return null // Continue with request
  }
} 