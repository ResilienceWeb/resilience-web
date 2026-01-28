import type { Metadata } from 'next'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'
import '@styles/styles.global.css'
import { REMOTE_URL } from '@helpers/config'
import { PageTracker } from '@helpers/page-tracker/PageTracker'
import { Toaster } from '@components/ui/sonner'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <PageTracker />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
