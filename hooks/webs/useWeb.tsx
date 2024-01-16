import { useQuery } from '@tanstack/react-query'

async function fetchWebRequest({ queryKey }) {
  const [_key, { webSlug, withAdminInfo }] = queryKey
  const response = await fetch(
    `/api/webs/${webSlug}?withAdminInfo=${withAdminInfo}`,
  )
  const data = await response.json()
  const { web } = data
  return web
}

export default function useWeb({ webSlug, withAdminInfo = false }) {
  const {
    data: web,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['webs', { webSlug, withAdminInfo }],
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
