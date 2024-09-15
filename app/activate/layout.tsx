import { Suspense } from 'react'
import { auth } from '@auth'
import SessionProvider from '../admin/SessionProvider'

export default async function Layout({ children }) {
  const session = await auth()

  return (
    <Suspense>
      <SessionProvider session={session}>{children}</SessionProvider>
    </Suspense>
  )
}
