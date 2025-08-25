import { useQuery } from '@tanstack/react-query'
import { useSession } from '@auth-client'

async function fetchPermissionsRequest() {
  const response = await fetch('/api/permissions')
  const data = await response.json()
  const listingIds = data.permission?.listings.map((l) => l.id)
  const webIds = data.permission?.webs.map((l) => l.id)
  return { listingIds, webIds, fullPermissionData: data.permission }
}

export default function usePermissions() {
  const { data: session } = useSession()

  const {
    data: permissions,
    isPending,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['permission'],
    queryFn: fetchPermissionsRequest,
    enabled: Boolean(session),
  })

  return {
    permissions,
    isPending,
    isFetching,
    isError,
  }
}
