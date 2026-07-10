import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string, value: string, options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin/login') && 
      !request.nextUrl.pathname.startsWith('/admin/recuperar-senha') &&
      !request.nextUrl.pathname.startsWith('/admin/redefinir-senha')) {
    
    if (!user) {
      // no user, redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (!profile || profile.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/' // Redirect non-admins to home
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated admins from login to dashboard
  if (user && (
    request.nextUrl.pathname === '/admin/login' || 
    request.nextUrl.pathname === '/admin'
  )) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile && profile.role === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/imoveis'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
