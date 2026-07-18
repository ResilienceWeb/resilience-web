import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()

  // Get pathname of request (e.g. /blog-slug)
  const { pathname } = req.nextUrl

  // Block common scanner/bot paths early to prevent unnecessary processing
  const scannerPatterns = [
    '.php',
    '.asp',
    '.aspx',
    '.jsp',
    '.cgi',
    'wp-',
    'wordpress',
    'xmlrpc',
    '.env',
    '.git',
    'phpmyadmin',
    '.sql',
    'backup',
  ]

  if (
    scannerPatterns.some((pattern) => pathname.toLowerCase().includes(pattern))
  ) {
    return new Response(null, { status: 404 })
  }

  // Get hostname of request
  const hostname = req.headers.get('host')
  if (!hostname) {
    return new Response(null, {
      status: 400,
      statusText: 'No hostname found in request headers',
    })
  }

  // Permanently redirect alternate hostnames to the primary domain so search
  // engines only ever see one host per page (www, the Netlify alias and the
  // legacy Cambridge domain used to serve identical content via rewrites).
  const PRIMARY_DOMAIN = 'resilienceweb.org.uk'
  let redirectHost: string | null = null
  if (
    hostname === `www.${PRIMARY_DOMAIN}` ||
    hostname === 'resilienceweb.netlify.app' ||
    hostname === 'cambridgeresilienceweb.org.uk' ||
    hostname === 'www.cambridgeresilienceweb.org.uk'
  ) {
    redirectHost = PRIMARY_DOMAIN
  } else if (hostname.endsWith('.cambridgeresilienceweb.org.uk')) {
    const subdomain = hostname.replace('.cambridgeresilienceweb.org.uk', '')
    redirectHost = `${subdomain}.${PRIMARY_DOMAIN}`
  }
  if (redirectHost) {
    return NextResponse.redirect(
      `https://${redirectHost}${pathname}${req.nextUrl.search}`,
      301,
    )
  }

  // Old /index URLs should resolve to the homepage rather than being treated
  // as a web called "index" by the [subdomain] route.
  if (pathname === '/index') {
    url.pathname = '/'
    return NextResponse.redirect(url, 301)
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
        : hostname
            .replace(`.localhost:4000`, '')
            .replace('.10.0.2.2.nip.io:4000', '')
  }

  if (hostname === 'transition') {
    return NextResponse.rewrite(new URL('/transition', req.url))
  }

  if (currentHost === 'cambridge-city') {
    return NextResponse.redirect(
      `https://cambridge.resilienceweb.org.uk${pathname}`,
    )
  }

  if (!pathname.includes('.') && !pathname.startsWith('/api')) {
    if (
      hostname === 'localhost:4000' ||
      hostname === '10.0.2.2.nip.io:4000' ||
      hostname === 'cambridgeresilienceweb.org.uk' ||
      hostname === 'resilienceweb.org.uk' ||
      hostname === 'staging.resilienceweb.org.uk' ||
      hostname === 'resilienceweb.netlify.app' ||
      currentHost === 'www' ||
      hostname.endsWith('--resilienceweb.netlify.app')
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
    '/((?!api|admin|_next/static|_next/image|sitemap.xml|robots.txt|favicon.svg|favicon.ico).*)',
  ],
}
