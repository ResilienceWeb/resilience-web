import { useQuery } from '@tanstack/react-query'

async function fetchWebsRequest() {
  const response = await fetch(`/api/webs?withListings=true&published=true`)
  const responseJson = await response.json()
  const { data: webs } = responseJson
  return webs || []
}

export default function useWebsPublic() {
  const {
    data: webs,
    isPending,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['webs', { public: true }],
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
