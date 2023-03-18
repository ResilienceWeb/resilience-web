import { useQuery } from '@tanstack/react-query'
import { Location } from '@prisma/client'

async function fetchWebRequest(slug) {
  const response = await fetch(`/api/webs/${slug}`)
  const data: { web: null | Location } = await response.json()
  const { web } = data
  return web
}

export default function useWeb(slug) {
  const {
    data: web,
    isLoading,
    isError,
  } = useQuery([`web-${slug}`], () => fetchWebRequest(slug), {
    refetchOnWindowFocus: false,
    enabled: slug !== undefined && slug !== '',
  })

  return {
    web,
    isLoading,
    isError,
  }
}

