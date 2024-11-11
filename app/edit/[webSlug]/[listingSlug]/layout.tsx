import { auth } from '@auth'
import { redirect } from 'next/navigation'
import { REMOTE_URL } from '@helpers/config'
import SessionProvider from '../../../admin/SessionProvider'

// TODO: export metadata

export default async function Layout({ children, params }) {
  const session = await auth()
  if (!session) {
    redirect(
      `${REMOTE_URL}/auth/signin?redirectTo=${`/edit/${params.webSlug}/${params.listingSlug}`}`,
    )
  }

  return <SessionProvider session={session}>{children}</SessionProvider>
}
