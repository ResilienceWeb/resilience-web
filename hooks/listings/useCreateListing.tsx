import { useMutation, useQueryClient } from '@tanstack/react-query'

async function createListingRequest(listingData) {
  const formData = new FormData()
  Object.keys(listingData).forEach((key) => {
    if (key === 'socials' || key === 'actions') {
      formData.append(key, JSON.stringify(listingData[key]))
    } else {
      formData.append(key, listingData[key])
    }
  })

  const response = await fetch('/api/listings', {
    method: 'POST',
    body: formData,
  })

  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useCreateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createListingRequest,
    onMutate: (newListing) => {
      const previousListings = queryClient.getQueryData(['listings', 'list'])
      queryClient.setQueryData(['listings', newListing.id], newListing)
      return { previousListings, newListing }
    },
    onError: (_err, _newListing, context) => {
      queryClient.setQueryData(['listings'], context?.previousListings)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['listings'],
      })
    },
  })
}
