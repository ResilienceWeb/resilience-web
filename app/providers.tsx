'use client'
import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { ReCaptchaProvider } from 'next-recaptcha-v3'

const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false,
})

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function Providers({ children }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient()

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: '/ph-ingest',
        ui_host: 'https://eu.posthog.com',
        debug: false,
        capture_pageview: false,
        capture_pageleave: true,
        persistence: 'localStorage',
      })
    }
  }, [])

  return (
    <PostHogProvider client={posthog}>
      <QueryClientProvider client={queryClient}>
        <PostHogPageView />
        <ReCaptchaProvider>{children}</ReCaptchaProvider>
        <ReactQueryDevtools buttonPosition="bottom-left" />
      </QueryClientProvider>
    </PostHogProvider>
  )
}
