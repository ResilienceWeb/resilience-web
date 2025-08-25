import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@auth'
import { REMOTE_URL } from '@helpers/config'

export const metadata: Metadata = {
  title: 'Propose Listing | Resilience Web',
  openGraph: {
    title: 'Propose Listing | Resilience Web',
  },
}

export default async function Layout(props) {
  const params = await props.params

  const { children } = props

  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    redirect(
      `${REMOTE_URL}/auth/signin?redirectTo=${`/new-listing/${params.webSlug}`}`,
    )
  }

  return { children }
}
