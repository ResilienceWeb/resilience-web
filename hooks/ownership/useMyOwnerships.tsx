import { useQuery } from '@tanstack/react-query'
import { useSession } from '@auth-client'

async function fetchMyOwnershipsRequest() {
  const response = await fetch(`/api/ownerships`)
  const data = await response.json()
  return data.ownerships
}

export default function useMyOwnerships() {
  const { data: session } = useSession()

  const {
    data: ownerships,
    isPending,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['my-ownerships'],
    queryFn: fetchMyOwnershipsRequest,
    enabled: Boolean(session),
    refetchOnWindowFocus: false,
  })

  return {
    ownerships,
    isPending,
    isFetching,
    isError,
  }
}
