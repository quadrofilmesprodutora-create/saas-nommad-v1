'use client'

import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_CONFIGURED, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env'

const previewStub = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get: (_t, prop) => {
    if (prop === 'auth') {
      return new Proxy({}, {
        get: (_a, method) => async () => ({ data: null, error: new Error('Preview mode — Supabase not configured') }),
      })
    }
    return () => ({ data: null, error: new Error('Preview mode — Supabase not configured') })
  },
})

export function createSupabaseClient() {
  if (!SUPABASE_CONFIGURED) return previewStub
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
