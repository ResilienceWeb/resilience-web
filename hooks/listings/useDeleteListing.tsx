import { useMutation, useQueryClient } from '@tanstack/react-query'

async function deleteListingRequest({ slug, webId }) {
  const response = await fetch(`/api/listings/${slug}`, {
    method: 'DELETE',
    body: JSON.stringify({
      webId,
    }),
  })
  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteListingRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['listings'],
      })
    },
  })
}
