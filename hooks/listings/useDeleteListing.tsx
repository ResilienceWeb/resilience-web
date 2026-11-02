import { useMutation, useQueryClient } from '@tanstack/react-query'
import { captureEvent } from '@helpers/posthog'
import { useAppContext } from '@store/hooks'

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
  const { selectedWebSlug: webSlug } = useAppContext()

  return useMutation({
    mutationFn: deleteListingRequest,
    onSuccess: (_data, variables) => {
      captureEvent('listing-deleted', {
        listingSlug: variables.slug,
        webSlug,
      })
      void queryClient.invalidateQueries({
        queryKey: ['listings'],
      })
    },
  })
}
