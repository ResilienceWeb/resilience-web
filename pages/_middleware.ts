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

    if (pathname.startsWith(`/_sites`)) {
        return new Response(null, {
            status: 404,
        })
    }

    if (!pathname.includes('.') && !pathname.startsWith('/api')) {
        console.log(currentHost)
        if (currentHost == 'app') {
            if (
                pathname === '/login' &&
                (req.cookies['next-auth.session-token'] ||
                    req.cookies['__Secure-next-auth.session-token'])
            ) {
                url.pathname = '/'
                return NextResponse.redirect(url)
            }

            url.pathname = `/app${pathname}`
            return NextResponse.rewrite(url)
        }

        if (
            hostname === 'localhost:3000' ||
            hostname === 'cambridgeresilienceweb.org.uk' ||
            hostname === 'resilienceweb.org.uk'
        ) {
            url.pathname = `/home`
            return NextResponse.rewrite(url)
        }

        url.pathname = `/_sites/${currentHost}${pathname}`
        return NextResponse.rewrite(url)
    }
}

