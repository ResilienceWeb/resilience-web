import { useQuery } from '@tanstack/react-query'
import { useSession } from '@auth-client'

async function fetchAllPermissionsRequest() {
  const response = await fetch('/api/permissions/all')
  const data = await response.json()
  const { permissions } = data
  return permissions
}

export default function useAllPermissions() {
  const { data: session } = useSession()

  const {
    data: permissions,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['all-permissions'],
    queryFn: fetchAllPermissionsRequest,
    enabled: session && session.user.role === 'admin',
  })

  return {
    permissions,
    isPending,
    isError,
  }
}
