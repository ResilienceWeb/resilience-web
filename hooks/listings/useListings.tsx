import { useQuery } from '@tanstack/react-query'

import { useAppContext } from '@store/hooks'

async function fetchListingsRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/listings?web=${webSlug}`)
  const data = await response.json()
  const { listings } = data
  return listings
}

export default function useListings() {
  const { selectedWebSlug: webSlug } = useAppContext()
  const {
    data: listings,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['listings', { webSlug }],
    queryFn: fetchListingsRequest,
    enabled: webSlug !== null && webSlug !== undefined,
  })

  return {
    listings,
    isPending,
    isError,
  }
}
