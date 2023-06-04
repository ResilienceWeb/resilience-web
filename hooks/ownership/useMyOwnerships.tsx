import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

async function fetchMyOwnershipsRequest() {
  const response = await fetch(`/api/ownerships`)
  const data = await response.json()
  return data.ownerships
}

export default function useMyOwnerships() {
  const { data: session } = useSession()

  const {
    data: ownerships,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['my-ownerships'],
    queryFn: fetchMyOwnershipsRequest,
    enabled: Boolean(session),
    refetchOnWindowFocus: false,
  })

  return {
    ownerships,
    isLoading,
    isError,
  }
}

