import type { Web } from '@prisma-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

async function unpublishWebRequest(webSlug: string) {
  const response = await fetch(`/api/webs/${webSlug}/unpublish`, {
    method: 'POST',
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to unpublish web')
  }

  const data: { web: Web } = await response.json()
  const { web } = data
  return web
}

export default function useUnpublishWeb(webSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => unpublishWebRequest(webSlug),
    onSuccess: (data) => {
      // Invalidate and refetch queries related to webs
      queryClient.invalidateQueries({
        queryKey: ['webs'],
      })
      // Update specific web data in cache if needed
      queryClient.invalidateQueries({
        queryKey: ['webs', { webSlug: data.slug }],
      })
    },
  })
}
