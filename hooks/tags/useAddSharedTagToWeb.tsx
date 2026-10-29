import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function addSharedTagToWebRequest({ tagId, webId }) {
  const response = await fetch(`/api/tags/${tagId}/web`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({ webId }),
  })
  if (!response.ok) {
    throw new Error(`Unable to add tag ${tagId} (${response.status})`)
  }

  const { data } = await response.json()
  return data
}

/** Adds a shared tag to the selected web, which puts it in its pickers. */
export default function useAddSharedTagToWeb() {
  const queryClient = useQueryClient()
  const { selectedWebSlug: webSlug, selectedWebId: webId } = useAppContext()

  return useMutation({
    mutationFn: ({ tagId }: { tagId: number }) =>
      addSharedTagToWebRequest({ tagId, webId }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['tags', { webSlug }] })
      void queryClient.invalidateQueries({
        queryKey: ['sharedTags', { webSlug }],
      })
    },
  })
}
