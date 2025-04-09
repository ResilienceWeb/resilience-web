import { useMutation, useQueryClient } from '@tanstack/react-query'

async function applyListingEditRequest({ listingId, listingEditId }) {
  const response = await fetch(`/api/listing/${listingId}/apply-edit`, {
    method: 'POST',
    body: JSON.stringify({
      listingEditId,
    }),
  })

  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useApplyListingEdit({ webSlug, listingSlug }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: applyListingEditRequest,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['listings', 'detail', { webSlug, listingSlug }],
      })
    },
  })
}
