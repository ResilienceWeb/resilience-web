import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { DefaultSeo } from 'next-seo'
import {
  ChakraProvider,
  defineStyleConfig,
  extendTheme,
} from '@chakra-ui/react'
import {
  HydrationBoundary,
  QueryClientProvider,
  QueryClient,
} from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from 'next-auth/react'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'
import '@styles/colors.css'
import '@styles/styles.global.scss'
import '@styles/vis-network-simplified.css'
import StoreProvider from '@store/StoreProvider'

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: 'https://resilienceweb.org.uk/ingest',
    ui_host: 'https://eu.posthog.com',
    debug: false,
  })
  posthog.debug(false)
}

const Button = defineStyleConfig({
  defaultProps: {
    colorScheme: 'rw',
  },
  variants: {
    outline: {
      borderColor: 'rw.700',
      _hover: {
        bg: 'rw.100',
        color: 'rw.900',
      },
    },
    rw: {
      color: 'white',
      bg: 'rw.700',
      _hover: {
        bg: 'rw.900',
      },
    },
  },
})

const theme = extendTheme({
  styles: {
    global: {
      'button:focus': {
        boxShadow: 'none !important',
      },
      'input:focus': {
        boxShadow: 'none !important',
      },
    },
  },
  components: {
    Button,
  },
  colors: {
    rw: {
      100: '#ccffd2',
      200: '#b4fdbd',
      300: '#8fef99',
      400: '#75d77e',
      500: '#64b46c',
      600: '#429466',
      700: '#3A8159',
      800: '#219152',
      900: '#09622f',
    },
  },
  fonts: {
    body: "'Poppins', sans-serif",
    heading: "'Poppins', sans-serif",
  },
})

function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter()
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog?.capture('$pageview')
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <DefaultSeo
        title="Resilience Web"
        openGraph={{
          type: 'website',
          locale: 'en_GB',
          title: 'Resilience Web',
          description:
            'A web of connections, showing local groups working to co-create a more socially and environmentally just city.',
        }}
        twitter={{
          handle: '@ResilienceWeb',
          cardType: 'summary_large_image',
        }}
      />
      <Head>
        <meta charSet="utf-8" />
        <meta property="og:locale" content="en_GB" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <meta name="og:image" content="static/preview-image.png" />
        <meta
          name="google-site-verification"
          content="ChMwFePa1V0s36L1f6Gj4CaD74qxfcMSNas2w0GGu1Q"
        />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <PostHogProvider client={posthog}>
        <SessionProvider refetchInterval={5 * 60} session={session}>
          <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={pageProps.dehydratedState}>
              <StoreProvider>
                <ChakraProvider theme={theme}>
                  <Component {...pageProps} />
                </ChakraProvider>
              </StoreProvider>
            </HydrationBoundary>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </QueryClientProvider>
        </SessionProvider>
      </PostHogProvider>
    </>
  )
}

export default App
