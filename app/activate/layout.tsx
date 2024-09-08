import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth'
import SessionProvider from '../admin/SessionProvider'

export default async function Layout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <Suspense>
      <SessionProvider session={session}>{children}</SessionProvider>
    </Suspense>
  )
}
