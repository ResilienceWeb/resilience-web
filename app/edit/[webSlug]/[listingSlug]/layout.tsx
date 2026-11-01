import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSessionSafe } from '@auth'
import { REMOTE_URL } from '@helpers/config'
import { canUserEditWebBySlug } from '@db/webAccessRepository'

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

  const session = await getSessionSafe(await headers())

  if (!session) {
    redirect(
      `${REMOTE_URL}/auth/signin?redirectTo=${`/edit/${params.webSlug}/${params.listingSlug}`}`,
    )
  }

  // People who can edit the web change the listing directly. The suggestion
  // form would only queue their change for their own review.
  const canEditWeb =
    session.user.role === 'admin' ||
    (await canUserEditWebBySlug(session.user.email, params.webSlug))

  if (canEditWeb) {
    redirect(
      `${REMOTE_URL}/admin/listings/${params.listingSlug}?web=${params.webSlug}`,
    )
  }

  return children
}
