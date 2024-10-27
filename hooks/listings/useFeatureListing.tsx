import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

const featureListingRequest = async (id) => {
  const response = await fetch(`api/listing/${id}/feature`, {
    method: 'PATCH',
  })

  const data = await response.json()
  const { listing } = data
  return listing
}

const unfeatureListingRequest = async (id) => {
  const response = await fetch(`api/listing/${id}/unfeature`, {
    method: 'PATCH',
  })

  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useFeatureListing() {
  const queryClient = useQueryClient()
  const { selectedWebSlug: webSlug } = useAppContext()

  const { mutate: featureListing } = useMutation({
    mutationFn: featureListingRequest,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['listings', 'list', { webSlug }],
      })
    },
  })

  const { mutate: unfeatureListing } = useMutation({
    mutationFn: unfeatureListingRequest,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['listings', 'list', { webSlug }],
      })
    },
  })

  return {
    featureListing,
    unfeatureListing,
  }
}
