import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import LayoutContainer from '@components/admin/layout-container'
import { authOptions } from '../auth'

export default async function Layout({ children }) {
  const user = await getServerSession(authOptions)
  if (!user) {
    redirect('/auth/signin')
  }

  return <LayoutContainer>{children}</LayoutContainer>
}
