import { useQuery } from '@tanstack/react-query'
import { useSession } from '@auth-client'

async function fetchMyWebAccessRequest() {
  const response = await fetch('/api/web-access')
  if (!response.ok) {
    throw new Error('Failed to fetch my web access')
  }
  
  const data = await response.json()
  return data.webAccess
}

export default function useMyWebAccess() {
  const { data: session } = useSession()

  const {
    data: webAccess,
    isPending,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['my-web-access'],
    queryFn: fetchMyWebAccessRequest,
    enabled: Boolean(session),
    refetchOnWindowFocus: false,
  })

  // Transform data to include accessible webs with roles
  const accessibleWebs = webAccess?.map(access => ({
    ...access.web,
    role: access.role,
    accessId: access.id,
    accessCreatedAt: access.createdAt,
  })) || []

  // Separate by role for convenience
  const ownedWebs = accessibleWebs.filter(web => web.role === 'OWNER')
  const editableWebs = accessibleWebs.filter(web => web.role === 'EDITOR')

  return {
    webAccess,
    accessibleWebs,
    ownedWebs,
    editableWebs,
    isPending,
    isFetching,
    isError,
    error,
  }
}
