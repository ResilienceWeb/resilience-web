import { headers } from 'next/headers'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import SessionProvider from './components/SessionProvider'
import Providers from './providers'
import { fetchWebsHydrate } from '@hooks/webs/useWebs'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'
import { REMOTE_URL } from '@helpers/config'
import { auth } from '@auth'

export const metadata = {
  title: 'Admin | Resilience Web',
  description:
    'A web of connections, showing local groups working to co-create a more socially and environmentally just city.',
}

async function fetchMyOwnershipsHydrate() {
  const response = await fetch(`${REMOTE_URL}/api/ownerships`, {
    headers: headers(),
  })
  const data = await response.json()
  return data.ownerships
}

export async function fetchPermissionsHydrate() {
  const response = await fetch(`${REMOTE_URL}/api/permissions`, {
    headers: headers(),
  })
  const data = await response.json()
  const listingIds = data.permission?.listings.map((l) => l.id)
  const webIds = data.permission?.webs.map((l) => l.id)
  return { listingIds, webIds, fullPermissionData: data.permission }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // eslint-disable-next-line @tanstack/query/stable-query-client
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['webs', { published: false, withAdminInfo: false }],
    queryFn: () => fetchWebsHydrate(),
  })

  await queryClient.prefetchQuery({
    queryKey: ['permission'],
    queryFn: () => fetchPermissionsHydrate(),
  })

  await queryClient.prefetchQuery({
    queryKey: ['my-ownerships'],
    queryFn: () => fetchMyOwnershipsHydrate(),
  })

  return (
    <html lang="en">
      <body>
        <Providers>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <SessionProvider session={session}>{children}</SessionProvider>
          </HydrationBoundary>
        </Providers>
      </body>
    </html>
  )
}
