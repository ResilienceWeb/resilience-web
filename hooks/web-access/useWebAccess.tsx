import { useQuery } from '@tanstack/react-query'
import { useSession } from '@auth-client'

async function fetchWebAccessRequest({ queryKey }) {
  const [_key, { webSlug, userEmail }] = queryKey

  const params = new URLSearchParams()
  if (webSlug) params.set('web', webSlug)
  if (userEmail) params.set('email', userEmail)

  const response = await fetch(`/api/web-access?${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch web access')
  }

  const data = await response.json()
  return data.webAccess
}

export default function useWebAccess({
  webSlug,
  userEmail,
}: {
  webSlug?: string
  userEmail?: string
} = {}) {
  const { data: session } = useSession()

  const {
    data: webAccess,
    isPending,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['web-access', { webSlug, userEmail }],
    queryFn: fetchWebAccessRequest,
    enabled: Boolean(session),
    refetchOnWindowFocus: false,
  })

  return {
    webAccess,
    isPending,
    isFetching,
    isError,
    error,
  }
}
