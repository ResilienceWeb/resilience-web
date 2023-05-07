import { useQuery } from '@tanstack/react-query'

async function fetchListingsRequest() {
  const response = await fetch('/api/listings')
  const data = await response.json()
  const { listings } = data
  return listings
}

export default function useAllListings() {
  const {
    data: listings,
    isLoading,
    isError,
  } = useQuery({ queryKey: ['listings'], queryFn: fetchListingsRequest })

  return {
    listings,
    isLoading,
    isError,
  }
}

