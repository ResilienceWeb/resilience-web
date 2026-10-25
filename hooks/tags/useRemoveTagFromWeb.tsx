import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function removeTagFromWebRequest({ tagId, webId }) {
  const response = await fetch(`/api/tags/${tagId}/listings`, {
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

/** Takes a tag off every listing in the selected web: how a web drops a shared tag. */
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
      void queryClient.invalidateQueries({ queryKey: ['listings'] })
    },
  })
}
