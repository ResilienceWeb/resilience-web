import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function updateListingRequest(listingData) {
  const formData = new FormData()
  Object.keys(listingData).forEach((key) =>
    formData.append(key, listingData[key]),
  )

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
    onSuccess: (data) => {
      queryClient.setQueryData(
        ['listings', 'detail', { webSlug, listingSlug: data.slug }],
        data,
      )
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
