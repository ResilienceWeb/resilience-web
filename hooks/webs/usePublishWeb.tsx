import { useMutation, useQueryClient } from '@tanstack/react-query'

async function publishWebRequest(webSlug) {
  const response = await fetch(`/api/webs/${webSlug}/publish`, {
    method: 'POST',
  })
  const data = await response.json()
  const { tag } = data
  return tag
}

export default function usePublishWeb(webSlug) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => publishWebRequest(webSlug),
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['webs'],
      })
    },
  })
}
