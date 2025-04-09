import { useMutation, useQueryClient } from '@tanstack/react-query'

async function deleteListingEditRequest({ listingSlug, webSlug }) {
  const response = await fetch(
    `/api/listings/${listingSlug}/edit?web=${webSlug}`,
    {
      method: 'DELETE',
    },
  )

  if (!response.ok) {
    throw new Error('Failed to delete listing edit')
  }

  const data = await response.json()
  return data
}

export default function useDeleteListingEdit() {
  const queryClient = useQueryClient()

  const {
    mutate: deleteListingEdit,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: deleteListingEditRequest,
    onSuccess: (_, variables) => {
      // Invalidate the listing edits query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: [
          'listingEdits',
          { webSlug: variables.webSlug, listingSlug: variables.listingSlug },
        ],
      })
      queryClient.invalidateQueries({
        queryKey: ['listings', 'list', { webSlug: variables.webSlug }],
      })
    },
  })

  return {
    deleteListingEdit,
    isPending,
    isError,
    error,
  }
}
