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
}

// const sentryWebpackPluginOptions = {
//     // Additional config options for the Sentry Webpack plugin. Keep in mind that
//     // the following options are set automatically, and overriding them is not
//     // recommended:
//     //   release, url, org, project, authToken, configFile, stripPrefix,
//     //   urlPrefix, include, ignore

//     silent: true, // Suppresses all logs
//     // For all available options, see:
//     // https://github.com/getsentry/sentry-webpack-plugin#options.
// }

module.exports = nextConfig

