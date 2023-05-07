import { useQuery } from '@tanstack/react-query'

import { useAppContext } from '@store/hooks'

export async function fetchListingsRequest({ queryKey }) {
  const [_key, { webSlug, listingSlug }] = queryKey
  const response = await fetch(`/api/listing/${listingSlug}?web=${webSlug}`)
  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useListing(listingSlug) {
  const { selectedWebSlug: webSlug } = useAppContext()
  const {
    data: listing,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['listing', { webSlug, listingSlug }],
    queryFn: fetchListingsRequest,
    enabled:
      listingSlug !== undefined &&
      listingSlug !== '' &&
      webSlug !== undefined &&
      webSlug !== '',
  })

  return {
    listing,
    isLoading,
    isError,
  }
}
