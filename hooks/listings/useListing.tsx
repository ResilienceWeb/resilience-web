import { useQuery } from '@tanstack/react-query'

export async function fetchListingsRequest(slug) {
  const response = await fetch(`/api/listing/${slug}`)
  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useListing(slug) {
  const {
    data: listing,
    isLoading,
    isError,
  } = useQuery([`listing-${slug}`], () => fetchListingsRequest(slug), {
    enabled: slug !== undefined && slug !== '',
  }) // Figure out better RQ caching

  return {
    listing,
    isLoading,
    isError,
  }
}
