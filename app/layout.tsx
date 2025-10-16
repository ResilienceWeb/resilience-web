import type { Metadata } from 'next'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'
import '@styles/styles.global.css'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { ViewTransitions } from 'next-view-transitions'
import { REMOTE_URL } from '@helpers/config'
import { PageTracker } from '@helpers/page-tracker/PageTracker'
import { Toaster } from '@components/ui/sonner'
import { fetchWebsHydrate } from '@hooks/webs/useWebs'
import Providers from './providers'

export const metadata: Metadata = {
  metadataBase: new URL(REMOTE_URL),
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
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['webs', { withAdminInfo: false }],
    queryFn: () => fetchWebsHydrate(),
  })

  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="32x32" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </head>
        <body>
          <PageTracker />
          <Providers>
            <HydrationBoundary state={dehydrate(queryClient)}>
              {children}
            </HydrationBoundary>
          </Providers>
          <Toaster />
        </body>
      </html>
    </ViewTransitions>
  )
}
