import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function removeTagFromWebRequest({ tagId, webId }) {
  const response = await fetch(`/api/tags/${tagId}/web`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({ webId }),
  })
  if (!response.ok) {
    throw new Error(`Unable to remove tag ${tagId} (${response.status})`)
  }

  const { data } = await response.json()
  return data
}

/** Removes a shared tag from the selected web, and so from its listings. */
export default function useRemoveTagFromWeb() {
  const queryClient = useQueryClient()
  const { selectedWebSlug: webSlug, selectedWebId: webId } = useAppContext()

  return useMutation({
    mutationFn: ({ tagId }: { tagId: number }) =>
      removeTagFromWebRequest({ tagId, webId }),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['tags', { webSlug }],
      })
      void queryClient.invalidateQueries({
        queryKey: ['sharedTags', { webSlug }],
      })
      void queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}
