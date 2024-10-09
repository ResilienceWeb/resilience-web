import { redirect } from 'next/navigation'
import { auth } from '@auth'

export default async function Layout({ children }) {
  const session = await auth()
  if (session) {
    redirect('/admin')
  }

  return children
}
