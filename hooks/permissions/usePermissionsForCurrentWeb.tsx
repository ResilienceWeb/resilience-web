import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useAppContext } from '@store/hooks'

async function fetchPermissionsForCurrentWebRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/permissions/${webSlug}`)
  const data = await response.json()
  const { permissions } = data
  return permissions
}

export default function usePermissionsForCurrentWeb() {
  const { status: sessionStatus } = useSession()
  const { selectedWebSlug: webSlug } = useAppContext()

  const {
    data: permissions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['current-web-permissions', { webSlug }],
    queryFn: fetchPermissionsForCurrentWebRequest,
    enabled: sessionStatus === 'authenticated',
  })

  return {
    data: permissions,
    isLoading,
    isError,
  }
}
