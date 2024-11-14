import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function fetchListingEditsRequest({ queryKey }) {
  const [_queryKey, { webSlug, listingSlug }] = queryKey
  const response = await fetch(
    `/api/listings/${listingSlug}/edit?web=${webSlug}`,
  )
  const data = await response.json()
  const { listingEdits } = data
  return listingEdits
}

export default function useListingEdits(listingSlug) {
  const { selectedWebSlug: webSlug } = useAppContext()
  const {
    data: listingEdits,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['listingEdits', { webSlug, listingSlug }],
    queryFn: fetchListingEditsRequest,
    enabled: webSlug !== null && webSlug !== undefined,
  })

  return {
    listingEdits,
    isPending,
    isError,
  }
}
