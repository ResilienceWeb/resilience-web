import { useQuery } from '@tanstack/react-query'

async function fetchWebsRequest({ queryKey }) {
  const [_key, { withAdminInfo }] = queryKey
  const response = await fetch(
    `/api/webs?withListings=true&withAdminInfo=${withAdminInfo}`,
  )
  const responseJson = await response.json()
  const { data: webs } = responseJson
  return webs || []
}

export default function useWebs({ withAdminInfo = false } = {}) {
  const {
    data: webs,
    isPending,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['webs', { withAdminInfo }],
    queryFn: fetchWebsRequest,
    refetchOnWindowFocus: false,
  })

  return {
    webs,
    isPending,
    isFetching,
    isError,
  }
}
