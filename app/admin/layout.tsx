import { redirect } from 'next/navigation'
import LayoutContainer from '@components/admin/layout-container'
import { getCurrentUser } from '@helpers/session'

export default async function Layout({ children }) {
  const user = await getCurrentUser()
  console.log(user)
  if (!user) {
    redirect('/auth/signin')
  }

  return <LayoutContainer>{children}</LayoutContainer>
}
