import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (all: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try {
            all.forEach(({ name, value, options }) => cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]))
          } catch {
            // server component — ignore
          }
        },
      },
    },
  )
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const PREVIEW_MODE = !SUPABASE_URL || SUPABASE_URL.includes('placeholder')

const FAKE_SESSION = {
  access_token: 'preview',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 9999999999,
  refresh_token: 'preview',
  user: {
    id: '00000000-0000-0000-0000-000000000000',
    email: 'preview@nommad.local',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: { name: 'Preview' },
    created_at: new Date().toISOString(),
  },
} as any

export async function getSession() {
  if (PREVIEW_MODE) return FAKE_SESSION
  const supabase = await createSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function requireSession() {
  if (PREVIEW_MODE) return FAKE_SESSION
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  return session
}
