const { withSentryConfig } = require('@sentry/nextjs');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.modules.push(__dirname)
    return config
  },
  images: {
    domains: [
      'resilienceweb.ams3.digitaloceanspaces.com',
      'media.graphcms.com',
      'via.placeholder.com',
      'opencollective.com',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  swcMinify: true,
  experimental: {
    scrollRestoration: process.env.NODE_ENV === 'development' ? false : true,
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  async headers() {
    return [
      {
        source: '/api/feedback',
        headers: [
          { 'key': 'Access-Control-Allow-Credentials', 'value': 'true' },
          { 'key': 'Access-Control-Allow-Origin', 'value': '*' },
          { 'key': 'Access-Control-Allow-Methods', 'value': 'GET,DELETE,PATCH,POST,PUT' },
          { 'key': 'Access-Control-Allow-Headers', 'value': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, baggage, sentry-trace' }
        ]
      }
    ]
  }
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

module.exports = withSentryConfig(
  module.exports,
  {
    org: 'resilience-web',
    project: 'resilience-web',
    // Suppresses source map uploading logs during build
    silent: false,
  },
  {
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,
    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: false,
    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: '/monitoring',
    // Hides source maps from generated client bundles
    hideSourceMaps: true,
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
)
