import { useMutation, useQueryClient } from '@tanstack/react-query'

async function applyListingEditRequest({ listingId, listingEditId }) {
  const response = await fetch(`/api/listing/${listingId}/apply-edit`, {
    method: 'POST',
    body: JSON.stringify({
      listingEditId,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to apply listing edit')
  }

  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useApplyListingEdit({ webSlug, listingSlug }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: applyListingEditRequest,
    onSuccess: () => {
      // Clear the edit straight away rather than only invalidating: the listing
      // page we redirect to would otherwise render the cached edit (staleTime
      // keeps it fresh) and refuse to let the listing be edited.
      queryClient.setQueryData(['listingEdits', { webSlug, listingSlug }], [])
      queryClient.invalidateQueries({
        queryKey: ['listingEdits', { webSlug, listingSlug }],
      })
      queryClient.invalidateQueries({
        queryKey: ['listingEditsForWeb', { webSlug }],
      })
      queryClient.invalidateQueries({
        queryKey: ['listings', 'list', { webSlug }],
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['listings', 'detail', { webSlug, listingSlug }],
      })
    },
  })
}
