import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@auth'
import { REMOTE_URL } from '@helpers/config'

export const metadata: Metadata = {
  title: 'Edit Listing | Resilience Web',
  openGraph: {
    title: 'Edit Listing | Resilience Web',
  },
}

export default async function Layout(props) {
  const params = await props.params

  const { children } = props

  // Guard against invalid URLs (e.g., bots hitting /edit/undefined/some-listing)
  if (!params.webSlug || params.webSlug === 'undefined') {
    redirect(REMOTE_URL)
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect(
      `${REMOTE_URL}/auth/signin?redirectTo=${`/edit/${params.webSlug}/${params.listingSlug}`}`,
    )
  }

  return children
}
