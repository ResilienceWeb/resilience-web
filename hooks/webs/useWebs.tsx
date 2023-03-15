import type { Location } from '@prisma/client'
import { REMOTE_URL } from '@helpers/config'
import { useQuery } from '@tanstack/react-query'

const route = '/api/webs'

export async function fetchWebsRequest(isSSR = false) {
  const response = await fetch(isSSR ? `${REMOTE_URL}${route}` : route)
  const data: { webs: Location[] } = await response.json()
  const { webs } = data
  return webs || []
}

export default function useWebs() {
  const {
    data: webs,
    isLoading,
    isError,
  } = useQuery(['webs'], () => fetchWebsRequest(false), {
    refetchOnWindowFocus: false,
  })

  return {
    webs,
    isLoading,
    isError,
  }
}
