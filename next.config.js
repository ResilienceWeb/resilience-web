// @ts-check

import { withSentryConfig } from '@sentry/nextjs'

const isDev = process.env.NODE_ENV === 'development'

// Sentry's CSP collector, built from the same public DSN the browser SDK
// already ships in instrumentation-client.ts.
const CSP_REPORT_URI =
  'https://o4505069644611584.ingest.sentry.io/api/4505069646643200/security/?sentry_key=a205584b48c84a7fbfcd3632479d33f7'

// Served as report-only. Every directive below is believed correct, but a
// wrong one silently breaks the site for everyone, so it collects violations
// in Sentry first and gets promoted to `Content-Security-Policy` once a week
// of real traffic comes back quiet.
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // Next inlines hydration payloads into prerendered HTML, and a nonce cannot
  // be baked into a page generated at build time — so 'unsafe-inline' is
  // unavoidable here, and this policy is *not* what stops an injected inline
  // handler. Sanitising rich text is. What this does buy: unknown script
  // origins are blocked, and connect-src bounds where a payload could send
  // anything it managed to read.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://cdn.tiny.cloud https://eu-assets.i.posthog.com`,
  "style-src 'self' 'unsafe-inline' https://cdn.tiny.cloud",
  "font-src 'self' data: https://cdn.tiny.cloud",
  // Listing descriptions embed images from arbitrary hosts by design, so an
  // origin list would be permanently incomplete. Images are not executable.
  "img-src 'self' data: blob: https:",
  "media-src 'self' https:",
  [
    "connect-src 'self'",
    'https://eu.i.posthog.com',
    'https://eu-assets.i.posthog.com',
    'https://*.ingest.sentry.io',
    'https://*.ingest.de.sentry.io',
    'https://nominatim.openstreetmap.org',
    'https://cdn.tiny.cloud',
  ].join(' '),
  // TinyMCE renders its editor into a blob: iframe.
  "frame-src 'self' blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
  `report-uri ${CSP_REPORT_URI}`,
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  // No `preload` — that is a one-way door that needs a deliberate submission.
  // includeSubDomains covers every web's subdomain, all of which are HTTPS.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
]

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: false,
  reactCompiler: true,
  // Keep sharp out of the bundler so it's loaded from node_modules at runtime
  serverExternalPackages: ['sharp'],
  // Force the Linux native binary + libvips shared object to be traced into the
  // deployed function bundle. Without this, Netlify's file tracing misses the
  // dynamically-required libvips-cpp.so and sharp fails to load at runtime.
  outputFileTracingIncludes: {
    '/api/**': [
      './node_modules/@img/sharp-linux-x64/**/*',
      './node_modules/@img/sharp-libvips-linux-x64/**/*',
    ],
  },
  images: {
    qualities: [80],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resilienceweb.ams3.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'resilienceweb.ams3.cdn.digitaloceanspaces.com'
      },
      {
        protocol: 'https',
        hostname: 'kdfprvggsvdbybtdpojv.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'media.graphcms.com',
      },
      {
        protocol: 'https',
        hostname: 'media.graphassets.com',
      },
      {
        protocol: 'https',
        hostname: 'eu-central-1.graphassets.com'
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'opencollective.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.transitionnetwork.org'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    scrollRestoration: process.env.NODE_ENV === 'development' ? false : true,
    staticGenerationMaxConcurrency: 5,
  },
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/api/contact',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, baggage, sentry-trace',
          },
        ],
      },
    ]
  }
}

export default withSentryConfig(
  nextConfig,
  {
    org: 'resilience-web',
    project: 'resilience-web',
    telemetry: false,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    // Suppresses source map uploading logs during build
    silent: true,
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: false,
    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    // tunnelRoute: '/monitoring',
  },
)
