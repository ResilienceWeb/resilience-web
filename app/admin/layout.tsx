import { QueryClient } from '@tanstack/react-query'
// import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import LayoutContainer from '@components/admin/layout-container'
import { authOptions } from '../auth'
import { REMOTE_URL } from '@helpers/config'
import SessionProvider from './SessionProvider'
import Providers from './providers'

export const metadata = {
  title: 'Admin | Resilience Web',
  description:
    'A web of connections, showing local groups working to co-create a more socially and environmentally just city.',
  openGraph: {
    title: 'Resilience Web',
  },
}

async function fetchMyOwnershipsHydrate() {
  const response = await fetch(`${REMOTE_URL}/api/ownerships`)
  const data = await response.json()
  return data.ownerships
}

export async function fetchPermissionsHydrate() {
  const response = await fetch(`${REMOTE_URL}/api/permissions`)
  const data = await response.json()
  const listingIds = data.permission?.listings.map((l) => l.id)
  const webIds = data.permission?.webs.map((l) => l.id)
  return { listingIds, webIds, fullPermissionData: data.permission }
}

export default async function Layout({ children }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }

  // eslint-disable-next-line @tanstack/query/stable-query-client
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['permission'],
    queryFn: () => fetchPermissionsHydrate(),
  })

  await queryClient.prefetchQuery({
    queryKey: ['my-ownerships'],
    queryFn: () => fetchMyOwnershipsHydrate(),
  })

  return (
    <Providers>
      <SessionProvider session={session}>
        <LayoutContainer>{children}</LayoutContainer>
      </SessionProvider>
    </Providers>
  )
}
