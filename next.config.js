// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ['durham.localhost', 'ely.localhost', 'cambridge-city.localhost'],
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
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'opencollective.com',
      },
      {
        protocol: 'https',
        hostname: 'transitiongroups.org'
      },
      {
        protocol: 'https',
        hostname: 'maps.transitionnetwork.org'
      }
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    scrollRestoration: process.env.NODE_ENV === 'development' ? false : true,
  },
  // eslint-disable-next-line @typescript-eslint/require-await
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
  // eslint-disable-next-line @typescript-eslint/require-await
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
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, baggage',
          },
        ],
      },
    ]
  }
}

export default nextConfig
