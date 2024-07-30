import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import LayoutContainer from '@components/admin/layout-container'
import { authOptions } from '../auth'

export const metadata = {
  title: 'Admin | Resilience Web',
  description:
    'A web of connections, showing local groups working to co-create a more socially and environmentally just city.',
  openGraph: {
    title: 'Resilience Web',
  },
}

export default async function Layout({ children }) {
  const user = await getServerSession(authOptions)
  if (!user) {
    redirect('/auth/signin')
  }

  return <LayoutContainer>{children}</LayoutContainer>
}
