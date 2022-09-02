/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query'

async function createListingRequest(listingData) {
  const formData = new FormData()
  Object.keys(listingData).map((key) => formData.append(key, listingData[key]))

  const response = await fetch('/api/listings/create', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useCreateListing() {
  const queryClient = useQueryClient()

  return useMutation(createListingRequest, {
    onMutate: async (newListing) => {
      await queryClient.cancelQueries(['listings'])
      const previousListings = queryClient.getQueryData(['listings'])
      queryClient.setQueryData(['listings', newListing.id], newListing)
      return { previousListings, newListing }
    },
    onError: (err, newListing, context) => {
      queryClient.setQueryData(['listings'], context.previousListings)
    },
    onSettled: () => {
      void queryClient.invalidateQueries(['listings'])
    },
  })
}
