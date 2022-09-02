import { useQuery } from '@tanstack/react-query'

import { useAppContext } from '@store/hooks'

async function fetchListingsRequest({ queryKey }) {
  const [_key, { siteSlug }] = queryKey
  const response = await fetch(`/api/listings?site=${siteSlug}`)
  const data = await response.json()
  const { listings } = data
  return listings
}

export default function useListings() {
  const { selectedSiteSlug: siteSlug } = useAppContext()
  const {
    data: listings,
    isLoading,
    isError,
  } = useQuery(['listings', { siteSlug }], fetchListingsRequest)

  return {
    listings,
    isLoading,
    isError,
  }
}
