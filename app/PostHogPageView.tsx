'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import type { PostHog } from 'posthog-js'
import { loadPostHog } from '@helpers/posthog'

/** Boots PostHog on idle and reports page views. */

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
