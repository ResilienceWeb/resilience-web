import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSessionSafe } from '@auth'

export default async function Layout({ children }) {
  const session = await getSessionSafe(await headers())
  if (session) {
    redirect('/admin')
  }

  return children
}
