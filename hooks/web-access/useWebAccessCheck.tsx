import { useQuery } from '@tanstack/react-query'
import { useSession } from '@auth-client'
import { useAppContext } from '@store/hooks'

async function fetchWebAccessCheckRequest({ queryKey }) {
  const [_key, { webSlug, webId }] = queryKey
  
  const params = new URLSearchParams()
  if (webSlug) params.set('web', webSlug)
  if (webId) params.set('webId', webId.toString())
  params.set('check', 'access')
  
  const response = await fetch(`/api/web-access/check?${params}`)
  if (!response.ok) {
    throw new Error('Failed to check web access')
  }
  
  const data = await response.json()
  return data
}

export default function useWebAccessCheck(webSlug?: string, webId?: number) {
  const { data: session } = useSession()
  const { selectedWebSlug, selectedWebId } = useAppContext()
  
  const targetWebSlug = webSlug || selectedWebSlug
  const targetWebId = webId || selectedWebId

  const {
    data: accessCheck,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['web-access-check', { webSlug: targetWebSlug, webId: targetWebId }],
    queryFn: fetchWebAccessCheckRequest,
    enabled: Boolean(session && (targetWebSlug || targetWebId)),
    refetchOnWindowFocus: false,
  })

  // Enhance with admin privileges
  const enhancedAccess = {
    hasAccess: accessCheck?.hasAccess || session?.user?.role === 'admin',
    role: session?.user?.role === 'admin' ? 'ADMIN' : accessCheck?.role,
    isOwner: accessCheck?.isOwner || session?.user?.role === 'admin',
    canEdit: accessCheck?.canEdit || session?.user?.role === 'admin',
  }

  return {
    ...enhancedAccess,
    isPending,
    isError,
    error,
  }
}
