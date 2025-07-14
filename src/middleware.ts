import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['he', 'en']
const defaultLocale = 'he'

function getLocale(request: NextRequest): string {
  // Check for stored locale preference in cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value
  if (localeCookie && locales.includes(localeCookie)) {
    return localeCookie
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')[0]
      .split('-')[0]
      .toLowerCase()
    
    if (locales.includes(preferredLocale)) {
      return preferredLocale
    }
  }

  return defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return
  }

  // Get the preferred locale and set it in the response headers and cookies
  const locale = getLocale(request)
  const response = NextResponse.next()
  
  // Set locale in cookie for client-side access
  response.cookies.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365 // 1 year
  })
  
  // Set locale in response headers for server-side access
  response.headers.set('x-locale', locale)
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 