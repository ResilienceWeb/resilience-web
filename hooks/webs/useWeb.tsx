import { useQuery } from '@tanstack/react-query'
import { Web } from '@prisma/client'

async function fetchWebRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/webs/${webSlug}`)
  const data: { web: Web } = await response.json()
  const { web } = data
  return web
}

export default function useWeb(webSlug) {
  const {
    data: web,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['webs', { webSlug }],
    queryFn: fetchWebRequest,
    refetchOnWindowFocus: false,
    enabled: webSlug !== undefined && webSlug !== '',
  })

  return {
    web,
    isPending,
    isError,
  }
}
