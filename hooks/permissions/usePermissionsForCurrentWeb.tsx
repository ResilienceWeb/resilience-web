import { useAppContext } from '@store/hooks'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@auth-client'

async function fetchPermissionsForCurrentWebRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/permissions/${webSlug}`)
  const data = await response.json()
  const { permissions } = data
  return permissions
}

export default function usePermissionsForCurrentWeb() {
  const { data: session } = useSession()
  const { selectedWebSlug: webSlug } = useAppContext()

  const {
    data: permissions,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['current-web-permissions', { webSlug }],
    queryFn: fetchPermissionsForCurrentWebRequest,
    enabled: Boolean(session),
  })

  return {
    data: permissions,
    isPending,
    isError,
  }
}
