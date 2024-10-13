import * as Sentry from '@sentry/nextjs'

export const onRequestError = Sentry.captureRequestError

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: 'https://a205584b48c84a7fbfcd3632479d33f7@o4505069644611584.ingest.sentry.io/4505069646643200',
      enabled: process.env.NODE_ENV === 'production',

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: 'https://a205584b48c84a7fbfcd3632479d33f7@o4505069644611584.ingest.sentry.io/4505069646643200',
      enabled: process.env.NODE_ENV === 'production',

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 1,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,
    })
  }
}
