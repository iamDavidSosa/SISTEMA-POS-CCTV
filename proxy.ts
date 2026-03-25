import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Si no está autenticado y trata de entrar al POS, redirige al login
  if (!user && request.nextUrl.pathname.startsWith('/pos')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si ya está autenticado y va al login, redirige al POS
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/pos', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/pos/:path*', '/login'],
}