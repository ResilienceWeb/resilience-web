import { useQuery } from '@tanstack/react-query'

import { useAppContext } from '@store/hooks'

async function fetchListingsRequest({ queryKey }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    isLoading,
    isError,
  } = useQuery(['listings', { webSlug }], fetchListingsRequest)

  return {
    listings,
    isLoading,
    isError,
  }
}
