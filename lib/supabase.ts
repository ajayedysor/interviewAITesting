import { createClient } from '@supabase/supabase-js'

// Global Supabase client instance with connection pooling
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Don't persist sessions in serverless
        autoRefreshToken: false, // Don't auto refresh in serverless
      }
    })
  }
  
  return supabaseClient
}

// Cleanup function for serverless environments
export function cleanupSupabaseClient() {
  if (supabaseClient) {
    // Close any active connections
    supabaseClient = null
  }
} 