import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_SERVICE_CONFIGURED } from '@/lib/env'

let cached: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (!SUPABASE_SERVICE_CONFIGURED) {
    throw new Error('[nommad:supabase:admin] SUPABASE_SERVICE_ROLE_KEY not set')
  }
  if (cached) return cached
  cached = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}
