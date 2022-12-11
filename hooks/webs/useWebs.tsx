import { useQuery } from '@tanstack/react-query'

async function fetchWebsRequest() {
  const response = await fetch('/api/webs')
  const data = await response.json()
  const { webs } = data
  return webs
}

export default function useWebs() {
  const {
    data: webs,
    isLoading,
    isError,
  } = useQuery(['webs'], fetchWebsRequest, {
    refetchOnWindowFocus: false,
  })

  return {
    webs,
    isLoading,
    isError,
  }
}
