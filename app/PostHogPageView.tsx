'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import type { PostHog } from 'posthog-js'

/**
 * Boots PostHog and reports page views.
 *
 * `posthog-js` is ~82 KiB gzipped and analytics is never on the critical path,
 * so it is imported on idle rather than statically from the root providers,
 * which put it in the entry chunk of every page.
 */

let clientPromise: Promise<PostHog | null> | null = null

function loadPostHog(): Promise<PostHog | null> {
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
        persistence: 'localStorage',
        capture_exceptions: true,
        capture_performance: true,
        session_recording: {
          maskAllInputs: false,
        },
      })
      return posthog
    })
    .catch(() => null)

  return clientPromise
}

function whenIdle(callback: () => void) {
  if (typeof window === 'undefined') return () => {}

  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(callback, { timeout: 5000 })
    return () => window.cancelIdleCallback(handle)
  }
  const timeout = window.setTimeout(callback, 2000)
  return () => window.clearTimeout(timeout)
}

export default function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [posthog, setPosthog] = useState<PostHog | null>(null)

  useEffect(() => {
    let cancelled = false
    const cancelIdle = whenIdle(() => {
      void loadPostHog().then((client) => {
        if (!cancelled) setPosthog(client)
        return client
      })
    })
    return () => {
      cancelled = true
      cancelIdle()
    }
  }, [])

  useEffect(() => {
    // Track pageviews
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      posthog.capture('$pageview', {
        $current_url: url,
      })
    }
  }, [pathname, posthog, searchParams])

  return null
}
