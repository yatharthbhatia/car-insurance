import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /admin)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login'

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || ''

  // Redirect logic
  if (isPublicPath && token) {
    // If user is already logged in and tries to access login page,
    // redirect to admin dashboard
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (!isPublicPath && !token && path.startsWith('/admin')) {
    // If user is not logged in and tries to access protected route,
    // redirect to login page
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Configure the paths that middleware should run on
export const config = {
  matcher: [
    '/admin/:path*',
    '/login'
  ]
}