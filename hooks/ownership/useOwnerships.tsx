import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useAppContext } from '@store/hooks'

async function fetchOwnershipsRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/ownerships?web=${webSlug}`)
  const data = await response.json()
  return data.ownerships
}

export default function useOwnerships() {
  const { data: session } = useSession()
  const { selectedWebSlug: webSlug } = useAppContext()

  const {
    data: ownerships,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['ownerships', { webSlug }],
    queryFn: fetchOwnershipsRequest,
    enabled: Boolean(session),
    refetchOnWindowFocus: false,
  })

  return {
    ownerships,
    isPending,
    isError,
  }
}
