import { redirect } from 'next/navigation'
import { auth } from '@auth'
import { REMOTE_URL } from '@helpers/config'
import SessionProvider from '../../../admin/SessionProvider'

export const metadata = {
  title: 'Edit Listing | Resilience Web',
  openGraph: {
    title: 'Edit Listing | Resilience Web',
  },
}

export default async function Layout(props) {
  const params = await props.params

  const { children } = props

  const session = await auth()
  if (!session) {
    redirect(
      `${REMOTE_URL}/auth/signin?redirectTo=${`/edit/${params.webSlug}/${params.listingSlug}`}`,
    )
  }

  return <SessionProvider session={session}>{children}</SessionProvider>
}
