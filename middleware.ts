/* eslint-disable sonarjs/cognitive-complexity */
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export default function middleware(req: NextRequest) {
  // Clone the request url
  const url = req.nextUrl.clone()

  // Get pathname of request (e.g. /blog-slug)
  const { pathname } = req.nextUrl

  // Get hostname of request (e.g. demo.vercel.pub)
  const hostname = req.headers.get('host')
  if (!hostname) {
    return new Response(null, {
      status: 400,
      statusText: 'No hostname found in request headers',
    })
  }

  const currentHost =
    process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
      ? hostname
          .replace(`.cambridgeresilienceweb.org.uk`, '')
          .replace(`.resilienceweb.org.uk`, '')
      : hostname.replace(`.localhost:3000`, '')

  console.log('DINER', {
    hostname,
    currentHost,
    pathname,
  })
  console.log('DINER2', {
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  })

  if (pathname.startsWith(`/_webs`)) {
    return new Response(null, {
      status: 404,
    })
  }

  if (!pathname.includes('.')) {
    if (
      hostname === 'localhost:3000' ||
      hostname === 'cambridgeresilienceweb.org.uk' ||
      hostname === 'resilienceweb.org.uk'
    ) {
      return NextResponse.rewrite(url)
    }

    url.pathname = `/_webs/${currentHost}${pathname}`
    return NextResponse.rewrite(url)
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
  matcher: ['/((?!api|admin|_next/static|_next/image|favicon.ico).*)'],
}



