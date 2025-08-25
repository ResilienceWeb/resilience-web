import { Suspense } from 'react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query'
import { auth } from '@auth'
import { REMOTE_URL } from '@helpers/config'
import LayoutContainer from '@components/admin/layout-container'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Admin | Resilience Web',
  description:
    'A web of connections, showing local groups working to co-create a more socially and environmentally just city.',
  openGraph: {
    title: 'Resilience Web',
  },
}

async function fetchMyOwnershipsHydrate() {
  const response = await fetch(`${REMOTE_URL}/api/ownerships`, {
    headers: await headers(),
  })
  const data = await response.json()
  return data.ownerships
}

export async function fetchPermissionsHydrate() {
  const response = await fetch(`${REMOTE_URL}/api/permissions`, {
    headers: await headers(),
  })
  const data = await response.json()
  const listingIds = data.permission?.listings.map((l) => l.id) ?? []
  const webIds = data.permission?.webs.map((l) => l.id) ?? []
  return { listingIds, webIds, fullPermissionData: data.permission }
}

export default async function Layout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    redirect('/auth/signin')
  }

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['permission'],
    queryFn: fetchPermissionsHydrate,
  })

  await queryClient.prefetchQuery({
    queryKey: ['my-ownerships'],
    queryFn: fetchMyOwnershipsHydrate,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Providers>
        <LayoutContainer>
          <Suspense>{children}</Suspense>
        </LayoutContainer>
      </Providers>
    </HydrationBoundary>
  )
}
