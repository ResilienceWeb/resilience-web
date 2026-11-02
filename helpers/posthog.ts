import type { PostHog, Properties } from 'posthog-js'

/**
 * `posthog-js` is ~100 KiB gzipped and analytics is never on the critical
 * path, so it is only ever imported dynamically. A single static
 * `import posthog from 'posthog-js'` anywhere puts it back in the entry chunk
 * of every route that reaches that module — go through these helpers instead.
 */

let clientPromise: Promise<PostHog | null> | null = null

export function loadPostHog(): Promise<PostHog | null> {
  if (clientPromise) return clientPromise

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) {
    clientPromise = Promise.resolve(null)
    return clientPromise
  }

  clientPromise = import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
        ui_host: 'https://eu.posthog.com',
        debug: false,
        capture_pageview: false,
        capture_pageleave: true,
        // Nothing is stored on the visitor's device, so analytics needs no consent banner
        cookieless_mode: 'always',
        capture_exceptions: true,
        capture_performance: true,
        session_recording: {
          maskAllInputs: true,
        },
      })
      return posthog
    })
    .catch(() => null)

  return clientPromise
}

export function captureEvent(event: string, properties?: Properties) {
  void loadPostHog().then((posthog) => posthog?.capture(event, properties))
}

export function captureEventAndReset(event: string) {
  void loadPostHog().then((posthog) => {
    posthog?.capture(event)
    posthog?.reset()
    return posthog
  })
}
