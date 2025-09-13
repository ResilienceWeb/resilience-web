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

async function fetchMyWebAccessHydrate() {
  const response = await fetch(`${REMOTE_URL}/api/web-access`, {
    headers: await headers(),
  })
  const data = await response.json()
  return data.webAccess
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
    queryKey: ['my-web-access'],
    queryFn: fetchMyWebAccessHydrate,
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
