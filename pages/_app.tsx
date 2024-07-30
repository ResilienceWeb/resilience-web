import { useState } from 'react'
import Head from 'next/head'
import { DefaultSeo } from 'next-seo'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import {
  HydrationBoundary,
  QueryClientProvider,
  QueryClient,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import posthog from 'posthog-js'
// import { PostHogProvider } from 'posthog-js/react'
import { ReCaptchaProvider } from 'next-recaptcha-v3'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'
import '@styles/colors.css'
import '@styles/styles.global.scss'
import { chakraTheme } from '@helpers/theme'

const theme = extendTheme(chakraTheme)

function App({ Component, pageProps: { session, ...pageProps } }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <>
      <DefaultSeo
        title="Resilience Web"
        openGraph={{
          type: 'website',
          locale: 'en_GB',
          title: 'Resilience Web',
          images: [{ url: 'static/preview-image.png' }],
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <meta
          name="google-site-verification"
          content="ChMwFePa1V0s36L1f6Gj4CaD74qxfcMSNas2w0GGu1Q"
        />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      {/* <PostHogProvider client={posthog}> */}
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={pageProps.dehydratedState}>
          <ChakraProvider theme={theme}>
            <ReCaptchaProvider>
              <Component {...pageProps} />
            </ReCaptchaProvider>
          </ChakraProvider>
        </HydrationBoundary>
        <ReactQueryDevtools />
      </QueryClientProvider>
      {/* </PostHogProvider> */}
    </>
  )
}

export default App
