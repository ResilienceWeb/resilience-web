import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import Providers from './providers'
import { fetchWebsHydrate } from '@hooks/webs/useWebs'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'

export const metadata = {
  title: 'Resilience Web',
  description:
    'A web of connections, showing local groups working to co-create a more socially and environmentally just city.',
  openGraph: {
    title: 'Resilience Web',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // eslint-disable-next-line @tanstack/query/stable-query-client
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['webs', { published: false, withAdminInfo: false }],
    queryFn: () => fetchWebsHydrate(),
  })

  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body>
        <Providers>
          <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
          </HydrationBoundary>
        </Providers>
      </body>
    </html>
  )
}
