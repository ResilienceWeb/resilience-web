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
    scrollRestoration: true,
  },
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

