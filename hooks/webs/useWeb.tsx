import { useQuery } from '@tanstack/react-query'
import { Location } from '@prisma/client'

async function fetchWebRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/webs/${webSlug}`)
  const data: { web: null | Location } = await response.json()
  const { web } = data
  return web
}

export default function useWeb(webSlug) {
  const {
    data: web,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['webs', { webSlug }],
    queryFn: fetchWebRequest,
    refetchOnWindowFocus: false,
    enabled: webSlug !== undefined && webSlug !== '',
  })

  return {
    web,
    isLoading,
    isError,
  }
}
