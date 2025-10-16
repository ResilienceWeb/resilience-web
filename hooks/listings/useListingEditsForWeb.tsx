import { useQuery } from '@tanstack/react-query'

async function fetchListingEditsForWebRequest({ queryKey }) {
  const [_queryKey, { webSlug, includeAccepted }] = queryKey
  const params = new URLSearchParams()
  if (includeAccepted) {
    params.append('includeAccepted', 'true')
  }
  const response = await fetch(
    `/api/webs/${webSlug}/listing-edits?${params.toString()}`,
  )
  const data = await response.json()
  const { listingEdits } = data
  return listingEdits
}

export default function useListingEditsForWeb(
  webSlug: string,
  includeAccepted = false,
) {
  const {
    data: listingEdits,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['listingEditsForWeb', { webSlug, includeAccepted }],
    queryFn: fetchListingEditsForWebRequest,
    enabled: webSlug !== null && webSlug !== undefined,
  })

  return {
    listingEdits,
    isPending,
    isError,
  }
}
