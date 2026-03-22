import { useMutation, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'

async function publishWebRequest(webSlug) {
  const response = await fetch(`/api/webs/${webSlug}/publish`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to publish web')
  }

  return response.json()
}

export default function usePublishWeb(webSlug) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => publishWebRequest(webSlug),
    onSuccess: () => {
      posthog.capture('web-published', { webSlug })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['webs'],
      })
    },
  })
}
