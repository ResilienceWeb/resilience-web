import { notFound } from 'next/navigation'
import { QueryClient } from '@tanstack/react-query'
import LayoutContainer from '@components/admin/layout-container'
import { getCurrentUser } from '@helpers/session'

export default async function Layout({ children }) {
  const user = await getCurrentUser()
  if (!user) {
    return notFound()
  }

  const queryClient = new QueryClient()
  queryClient.setQueryData(['session'], user)

  return <LayoutContainer>{children}</LayoutContainer>
}
