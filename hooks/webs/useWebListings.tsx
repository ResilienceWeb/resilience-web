import { useQuery } from '@tanstack/react-query'
import { WebListing } from 'pages/api/web-listings'

async function fetchWebListingsRequest() {
  const response = await fetch('/api/web-listings')
  const data: { webListings: null | WebListing[] } = await response.json()
  const { webListings } = data
  return webListings || []
}

export default function useWebListings() {
  const {
    data: webListings,
    isLoading,
    isError,
  } = useQuery(['webListings'], fetchWebListingsRequest, {
    refetchOnWindowFocus: false,
  })

  return {
    webListings,
    isLoading,
    isError,
  }
}
