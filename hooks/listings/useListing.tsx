import { useQuery } from '@tanstack/react-query'

import { useAppContext } from '@store/hooks'

export async function fetchListingRequest({ queryKey }) {
  const [_key1, _key2, { webSlug, listingSlug }] = queryKey
  const response = await fetch(`/api/listing/${listingSlug}?web=${webSlug}`)
  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useListing(listingSlug) {
  const { selectedWebSlug: webSlug } = useAppContext()
  const {
    data: listing,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['listings', 'detail', { webSlug, listingSlug }],
    queryFn: fetchListingRequest,
    enabled:
      listingSlug !== undefined &&
      listingSlug !== '' &&
      webSlug !== undefined &&
      webSlug !== '',
  })

  return {
    listing,
    isPending,
    isError,
  }
}
