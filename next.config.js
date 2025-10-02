// @ts-check

import { withSentryConfig } from '@sentry/nextjs'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: false,
  images: {
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
  async rewrites() {
    return [
      {
        source: "/ph-ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*"
      },
      {
        source: "/ph-ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*"
      },
      {
        source: "/ph-ingest/decide",
        destination: "https://eu.i.posthog.com/decide",
      },
    ]
  },
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        source: '/api/feedback',
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

export default withBundleAnalyzer(
  withSentryConfig(
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
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
      reactComponentAnnotation: {
        enabled: true,
      },
    },
  )
)
