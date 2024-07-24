import { redirect } from 'next/navigation'
import LayoutContainer from '@components/admin/layout-container'
import { auth } from '@auth'

export default async function Layout({ children }) {
  const user = await auth()
  if (!user) {
    redirect('/auth/signin')
  }

  return <LayoutContainer>{children}</LayoutContainer>
}
