import { useAppContext } from '@store/hooks'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@auth-client'

async function fetchWebAccessRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey

  const response = await fetch(`/api/web-access?web=${webSlug}`)
  if (!response.ok) {
    throw new Error('Failed to fetch web access')
  }

  const data = await response.json()
  return data.webAccess
}

export default function useWebAccess(webSlug?: string) {
  const { data: session } = useSession()
  const { selectedWebSlug } = useAppContext()
  const targetWebSlug = webSlug || selectedWebSlug

  const {
    data: webAccess,
    isPending,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['web-access-for-web', { webSlug: targetWebSlug }],
    queryFn: fetchWebAccessRequest,
    enabled: Boolean(session && targetWebSlug),
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
