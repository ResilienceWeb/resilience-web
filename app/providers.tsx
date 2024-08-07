'use client'
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
// import posthog from 'posthog-js'
// import { PostHogProvider } from 'posthog-js/react'
import { chakraTheme } from '@helpers/theme'

// if (
//   (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY,
//   process.env.NODE_ENV === 'production' &&
//     process.env.NEXT_PUBLIC_VERCEL_ENV === 'production')
// ) {
//   posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
//     api_host: '/ph-ingest',
//     ui_host: 'https://eu.posthog.com',
//     debug: false,
//     capture_pageview: false,
//   })
//   posthog.debug(false)
// }

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

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
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

const theme = extendTheme(chakraTheme)

export default function Providers({ children }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient()

  return (
    // <PostHogProvider client={posthog}>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
    // </PostHogProvider>
  )
}
