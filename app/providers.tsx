// In Next.js, this file would be called: app/providers.jsx
'use client'

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  ChakraProvider,
  defineStyleConfig,
  extendTheme,
} from '@chakra-ui/react'

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

const Button = defineStyleConfig({
  defaultProps: {
    colorScheme: 'rw',
  },
  variants: {
    outline: {
      color: 'rw.900',
      borderColor: 'rw.900',
      borderRadius: '10px',
      _hover: {
        bg: 'rw.100',
        color: 'rw.900',
      },
    },
    rw: {
      color: 'white',
      bg: 'rw.700',
      borderRadius: '10px',
      _hover: {
        bg: 'rw.900',
        _disabled: {
          bg: 'rw.900',
        },
      },
    },
    solid: {
      borderRadius: '10px',
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
      100: '#dff7e2',
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

export default function Providers({ children }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
