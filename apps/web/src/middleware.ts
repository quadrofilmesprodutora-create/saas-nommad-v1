import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_PATHS = ['/login', '/api/']

// PREVIEW MODE: bypass auth pra navegar a UI sem Supabase real.
// Quando for ligar de verdade, troque pra false.
const PREVIEW_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // pass public routes + assets
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next()
  if (pathname.startsWith('/_next') || pathname.includes('.')) return NextResponse.next()

  if (PREVIEW_MODE) return NextResponse.next()

  const res = NextResponse.next()

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

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
