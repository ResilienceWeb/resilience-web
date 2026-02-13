import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function updateListingRequest(listingData) {
  const formData = new FormData()
  Object.keys(listingData).forEach((key) => {
    if (key === 'socials' || key === 'actions') {
      formData.append(key, JSON.stringify(listingData[key]))
    } else {
      formData.append(key, listingData[key])
    }
  })

  const response = await fetch(`/api/listings/${listingData.slug}`, {
    method: 'PUT',
    body: formData,
  })

  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useUpdateListing() {
  const queryClient = useQueryClient()
  const { selectedWebSlug: webSlug } = useAppContext()

  return useMutation({
    mutationFn: updateListingRequest,
    onSettled: (updatedListing) => {
      queryClient.invalidateQueries({
        queryKey: [
          'listings',
          'detail',
          { webSlug, listingSlug: updatedListing.slug },
        ],
      })
      queryClient.invalidateQueries({
        queryKey: ['listings', 'list', { webSlug }],
      })
      queryClient.invalidateQueries({
        queryKey: ['categories', { webSlug }],
      })
      queryClient.invalidateQueries({
        queryKey: ['tags', { webSlug }],
      })
    },
  })
}
