import type { Location } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { REMOTE_URL } from '@helpers/config'

export async function fetchWebsHydrate() {
  const response = await fetch(`${REMOTE_URL}/api/webs?withListings=true`)
  const data: { webs: Location[] } = await response.json()
  const { webs } = data
  return webs || []
}

async function fetchWebsRequest() {
  const response = await fetch(`/api/webs?withListings=true`)
  const data: { webs: Location[] } = await response.json()
  const { webs } = data
  return webs || []
}

export default function useWebs() {
  const {
    data: webs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['webs'],
    queryFn: fetchWebsRequest,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })

  return {
    webs,
    isLoading,
    isError,
  }
}
