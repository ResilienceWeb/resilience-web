import { useState } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import { DefaultSeo } from 'next-seo'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import {
  Hydrate,
  QueryClientProvider,
  QueryClient,
} from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from 'next-auth/react'
import { Analytics } from '@vercel/analytics/react'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@styles/colors.css'
import '@styles/styles.global.scss'
import '@styles/vis-network.min.css'
import StoreProvider from '@store/StoreProvider'

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
  colors: {
    rw: {
      600: '#6BA182',
      700: '#3A8159',
      900: '#09622f',
    },
  },
  fonts: {
    body: "'Poppins', sans-serif",
    heading: "'Poppins', sans-serif",
  },
})

function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient())

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
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="og:image" content="static/preview-image.png" />
        <meta
          name="google-site-verification"
          content="ChMwFePa1V0s36L1f6Gj4CaD74qxfcMSNas2w0GGu1Q"
        />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <Script
        strategy="afterInteractive"
        src="https://cabin.resilienceweb.org.uk/hello.js"
      />
      <SessionProvider refetchInterval={5 * 60} session={pageProps.session}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <StoreProvider>
              <ChakraProvider theme={theme}>
                <Component {...pageProps} />
              </ChakraProvider>
            </StoreProvider>
          </Hydrate>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </SessionProvider>
      <Analytics />
    </>
  )
}

export default App
