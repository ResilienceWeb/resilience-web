import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function addTagToListingsRequest({ tagId, listingIds }) {
  const response = await fetch(`/api/tags/${tagId}/listings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(listingIds),
  })

  const data = await response.json()
  const { tag } = data
  return tag
}

export default function useAddTagToListings() {
  const queryClient = useQueryClient()
  const { selectedWebSlug: webSlug } = useAppContext()

  return useMutation({
    mutationFn: addTagToListingsRequest,
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['tags', { webSlug }],
      })
    },
  })
}
