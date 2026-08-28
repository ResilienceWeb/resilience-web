'use client'

import dynamic from 'next/dynamic'
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { TooltipProvider } from '@components/ui/tooltip'

// Dynamic so neither `posthog-js` nor its React bindings reach the entry chunk.
const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false,
})

const ReactQueryDevtools = dynamic(
  () =>
    import('@tanstack/react-query-devtools').then((m) => m.ReactQueryDevtools),
  { ssr: false },
)

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

  return (
    <QueryClientProvider client={queryClient}>
      {/*
        One provider for the whole app, as Radix intends. Mounting one per
        tooltip meant a list of 500 listings mounted 1000 of them, and each was
        its own scope — so moving between two tooltips always waited out the
        open delay instead of skipping it.
      */}
      <TooltipProvider>
        <PostHogPageView />
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools buttonPosition="bottom-right" />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  )
}
