import type { Location } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { REMOTE_URL } from '@helpers/config'

export async function fetchWebsRequest(isSSR = false, withListings = false) {
  const route = withListings ? `/api/webs?withListings=true` : '/api/webs'
  const response = await fetch(isSSR ? `${REMOTE_URL}${route}` : route)
  const data: { webs: Location[] } = await response.json()
  const { webs } = data
  return webs || []
}

export default function useWebs({ withListings = false } = {}) {
  const {
    data: webs,
    isLoading,
    isError,
  } = useQuery(['webs'], () => fetchWebsRequest(false, withListings), {
    refetchOnWindowFocus: false,
  })

  return {
    webs,
    isLoading,
    isError,
  }
}
