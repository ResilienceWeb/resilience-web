import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { captureEvent } from '@helpers/posthog'

async function deleteWebRequest(webSlug: string) {
  const response = await fetch(`/api/webs/${webSlug}/delete`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to delete web')
  }

  return response.json()
}

export default function useDeleteWeb(webSlug: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: () => deleteWebRequest(webSlug),
    onSuccess: () => {
      captureEvent('web-deleted', { webSlug })
      queryClient.invalidateQueries({
        queryKey: ['webs'],
      })
      queryClient.invalidateQueries({
        queryKey: ['webs', { webSlug }],
      })
      router.back()
    },
  })
}
