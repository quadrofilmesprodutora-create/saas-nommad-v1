import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { PREVIEW_MODE, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env'

const PUBLIC_PATHS = ['/', '/login', '/api/']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname === p || (p.endsWith('/') && pathname.startsWith(p)))) {
    return NextResponse.next()
  }
  if (pathname.startsWith('/_next') || pathname.includes('.')) return NextResponse.next()

  if (PREVIEW_MODE) return NextResponse.next()

  try {
    const res = NextResponse.next()

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (all: { name: string; value: string; options?: Parameters<typeof res.cookies.set>[2] }[]) =>
          all.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return res
  } catch (err) {
    console.error('[nommad:middleware] auth check failed:', err instanceof Error ? err.message : String(err))
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
