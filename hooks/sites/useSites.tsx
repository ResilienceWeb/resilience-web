import { useQuery } from '@tanstack/react-query'

async function fetchSitesRequest() {
  const response = await fetch('/api/sites')
  const data = await response.json()
  const { sites } = data
  return sites
}

export default function useSites() {
  const {
    data: sites,
    isLoading,
    isError,
  } = useQuery(['sites'], fetchSitesRequest)

  return {
    sites,
    isLoading,
    isError,
  }
}
