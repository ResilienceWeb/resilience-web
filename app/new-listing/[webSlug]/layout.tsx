import { redirect } from 'next/navigation'
import { auth } from '@auth'
import { REMOTE_URL } from '@helpers/config'
import SessionProvider from '../../admin/SessionProvider'

export const metadata = {
  title: 'Propose Listing | Resilience Web',
  openGraph: {
    title: 'Propose Listing | Resilience Web',
  },
}

export default async function Layout(props) {
  const params = await props.params

  const { children } = props

  const session = await auth()
  if (!session) {
    redirect(
      `${REMOTE_URL}/auth/signin?redirectTo=${`/new-listing/${params.webSlug}`}`,
    )
  }

  return <SessionProvider session={session}>{children}</SessionProvider>
}
