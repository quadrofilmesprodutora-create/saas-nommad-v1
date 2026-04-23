import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { PREVIEW_MODE, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/estrategia'

  if (PREVIEW_MODE) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  if (code) {
    try {
      const res = NextResponse.redirect(`${origin}${next}`)
      const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (all: { name: string; value: string; options?: Parameters<typeof res.cookies.set>[2] }[]) =>
            all.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
        },
      })
      await supabase.auth.exchangeCodeForSession(code)
      return res
    } catch (err) {
      console.error('[nommad:auth:callback] exchangeCodeForSession failed:', err instanceof Error ? err.message : String(err))
      return NextResponse.redirect(`${origin}/login?error=callback`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback`)
}
