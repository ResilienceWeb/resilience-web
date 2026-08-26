// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs'
import {
  BROWSER_EXTENSION_ERRORS,
  BROWSER_EXTENSION_URLS,
} from '@helpers/sentry'

// Fraction of requests traced. Errors are captured whatever this is.
const TRACES_SAMPLE_RATE = Number(
  process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1,
)

Sentry.init({
  dsn: 'https://a205584b48c84a7fbfcd3632479d33f7@o4505069644611584.ingest.sentry.io/4505069646643200',
  enabled: process.env.NODE_ENV === 'production',

  // Drop noise injected by browser extensions rather than our own code
  ignoreErrors: BROWSER_EXTENSION_ERRORS,
  denyUrls: BROWSER_EXTENSION_URLS,

  tracesSampleRate: TRACES_SAMPLE_RATE,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Session Replay is deliberately absent: it bundles rrweb into the entry
  // chunk on every page, and PostHog session recording already records this.
  integrations: [],
})

// ~21 KiB gzipped, and nobody clicks it in the first seconds of a page.
function loadFeedbackWidget() {
  void Sentry.lazyLoadIntegration('feedbackIntegration')
    .then((feedbackIntegration) => {
      Sentry.getClient()?.addIntegration(
        feedbackIntegration({ colorScheme: 'system' }),
      )
      return feedbackIntegration
    })
    .catch(() => {
      // A blocked or failed CDN fetch should cost the page nothing.
    })
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(loadFeedbackWidget, { timeout: 5000 })
  } else {
    window.setTimeout(loadFeedbackWidget, 3000)
  }
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
