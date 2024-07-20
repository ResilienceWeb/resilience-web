import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { getServerSession } from 'next-auth'
import SessionProvider from './components/SessionProvider'
import Providers from './providers'
import { fetchWebsHydrate } from '@hooks/webs/useWebs'
import { fetchPermissionsHydrate } from '@hooks/permissions/usePermissions'
import { fetchMyOwnershipsHydrate } from '@hooks/ownership/useMyOwnerships'
import { authOptions } from './auth'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'

export const metadata = {
  title: 'Admin | Resilience Web',
  description:
    'A web of connections, showing local groups working to co-create a more socially and environmentally just city.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

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
