import * as url from 'url'

import bundleAnalyzer from '@next/bundle-analyzer'
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import('./env.mjs'))

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

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

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)

