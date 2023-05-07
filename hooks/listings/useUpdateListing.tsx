import { useMutation, useQueryClient } from '@tanstack/react-query'

async function updateListingRequest(listingData) {
  const formData = new FormData()
  Object.keys(listingData).forEach((key) =>
    formData.append(key, listingData[key]),
  )

  const response = await fetch(`/api/listings/${listingData.id}`, {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useUpdateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateListingRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(['listings', { id: data.id }], data)
    },
    onMutate: async (newListing) => {
      await queryClient.cancelQueries(['listings', newListing.id])
      const previousListing = queryClient.getQueryData([
        'listings',
        newListing.id,
      ])
      queryClient.setQueryData(['listings', newListing.id], newListing)
      return { previousListing, newListing }
    },
    onError: (_err, _newListing, context) => {
      queryClient.setQueryData(
        ['listings', context.newListing.id],
        context.previousListing,
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries(['listings'])
    },
  })
}
