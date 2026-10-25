import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function addTagToListingsRequest({
  tagId,
  webId,
  addedListingIds,
  removedListingIds,
}) {
  const response = await fetch(`/api/tags/${tagId}/listings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      webId,
      addedListingIds,
      removedListingIds,
    }),
  })

  const data = await response.json()
  const { tag } = data
  return tag
}

export default function useAddTagToListings() {
  const queryClient = useQueryClient()
  const { selectedWebSlug: webSlug, selectedWebId: webId } = useAppContext()

  return useMutation({
    // A shared tag is in every web, so the server is told which one to change
    mutationFn: (variables: {
      tagId: number
      addedListingIds: number[]
      removedListingIds: number[]
    }) => addTagToListingsRequest({ ...variables, webId }),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['tags', { webSlug }],
      })
      void queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}
