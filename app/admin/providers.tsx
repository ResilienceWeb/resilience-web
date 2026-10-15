'use client'
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import StoreProvider from '@store/StoreProvider'
import { loadPostHog } from '../PostHogPageView'

export default function Providers({ children, userId }) {
  useEffect(() => {
    // Cookieless mode keeps the identity in memory only, so it has to be set
    // again on every page load rather than once at sign-in. The user id alone
    // is enough to join events up; their email stays out of both services.
    if (process.env.NODE_ENV !== 'production') return
    Sentry.setUser({ id: userId })
    void loadPostHog().then((posthog) => posthog?.identify(userId))
  }, [userId])

  return (
    <NuqsAdapter>
      <StoreProvider>{children}</StoreProvider>
    </NuqsAdapter>
  )
}
