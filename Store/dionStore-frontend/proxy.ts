import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Decode JWT payload (base64url) để đọc role mà không cần verify signature.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4)
    const decoded = Buffer.from(padded, 'base64').toString('utf-8')
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define protected routes (yêu cầu đăng nhập)
  const isProtectedRoute =
    path.startsWith('/profile') ||
    path.startsWith('/checkout') ||
    path.startsWith('/chat')
  const isAuthRoute = path === '/login' || path === '/register'

  const token = request.cookies.get('accessToken')?.value

  // --- Bảo vệ /admin: phải đăng nhập VÀ có role admin ---
  if (path.startsWith('/admin')) {
    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('from', path)
      return NextResponse.redirect(url)
    }
    const payload = decodeJwtPayload(token)
    const role = payload?.role as string | undefined
    if (!role || role.toLowerCase() !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', path)
    return NextResponse.redirect(url)
  }

  // Redirect to home if accessing auth routes while already logged in
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/checkout/:path*',
    '/chat/:path*',
    '/login',
    '/register',
  ],
}
