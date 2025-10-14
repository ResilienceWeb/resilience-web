import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()

  // Get pathname of request (e.g. /blog-slug)
  const { pathname } = req.nextUrl

  // Get hostname of request
  const hostname = req.headers.get('host')
  if (!hostname) {
    return new Response(null, {
      status: 400,
      statusText: 'No hostname found in request headers',
    })
  }

  let currentHost
  if (hostname.includes('staging.')) {
    currentHost = hostname.replace(`.staging.resilienceweb.org.uk`, '')
  } else {
    currentHost =
      process.env.NODE_ENV === 'production'
        ? hostname
            .replace('.cambridgeresilienceweb.org.uk', '')
            .replace('.resilienceweb.org.uk', '')
            .replace('.resilienceweb.netlify.app', '')
        : hostname.replace(`.localhost:4000`, '')
  }

  if (hostname === 'transition') {
    return NextResponse.rewrite(new URL('/transition', req.url))
  }

  if (currentHost === 'cambridge-city') {
    return NextResponse.redirect('https://cambridge.resilienceweb.org.uk')
  }

  if (!pathname.includes('.') && !pathname.startsWith('/api')) {
    if (
      hostname === 'localhost:4000' ||
      hostname === 'cambridgeresilienceweb.org.uk' ||
      hostname === 'resilienceweb.org.uk' ||
      hostname === 'staging.resilienceweb.org.uk' ||
      hostname === 'resilienceweb.netlify.app' ||
      currentHost === 'www' ||
      (process.env.VERCEL_ENV === 'preview' &&
        hostname === process.env.VERCEL_URL)
    ) {
      return NextResponse.rewrite(url)
    }

    return NextResponse.rewrite(new URL(`/${currentHost}${pathname}`, req.url))
  }
}

/*
 * Match all request paths except for the ones starting with:
 * - api (API routes)
 * - _next/static (static files)
 * - _next/image (image optimization files)
 * - favicon.ico (favicon file)
 */
export const config = {
  matcher: [
    '/((?!api|admin|_next/static|_next/image|favicon.svg|favicon.ico).*)',
  ],
}
