import { useQuery } from '@tanstack/react-query'

async function fetchWebRequest(slug) {
  const response = await fetch(`/api/webs/${slug}`)
  const data = await response.json()
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

