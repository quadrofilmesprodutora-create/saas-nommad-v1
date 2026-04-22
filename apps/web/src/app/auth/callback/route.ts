import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/estrategia'

  if (code) {
    const res = NextResponse.redirect(`${origin}${next}`)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (all: { name: string; value: string; options?: Parameters<typeof res.cookies.set>[2] }[]) => all.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
        },
      },
    )
    await supabase.auth.exchangeCodeForSession(code)
    return res
  }

  return NextResponse.redirect(`${origin}/login?error=callback`)
}
