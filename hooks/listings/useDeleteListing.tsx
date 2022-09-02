import { useMutation, useQueryClient } from '@tanstack/react-query'

async function deleteListingRequest({ id }) {
  const response = await fetch(`/api/listings/${id}`, {
    method: 'DELETE',
  })
  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation(deleteListingRequest, {
    onSuccess: (data) => {
      queryClient.setQueryData(['listings', { id: data.id }], data)
    },
    onSettled: () => {
      void queryClient.invalidateQueries(['listings'])
    },
  })
}
