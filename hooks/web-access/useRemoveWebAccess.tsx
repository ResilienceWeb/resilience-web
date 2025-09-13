import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface RemoveWebAccessParams {
  webId?: number
  webSlug?: string
  userEmail: string
}

async function removeWebAccessRequest(params: RemoveWebAccessParams) {
  const response = await fetch('/api/web-access', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to remove user from web')
  }

  return response.json()
}

export default function useRemoveWebAccess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeWebAccessRequest,
    onSuccess: (_data, variables) => {
      toast.success('Success', {
        description: `User ${variables.userEmail} removed from web`,
        duration: 5000,
      })

      queryClient.invalidateQueries({ queryKey: ['web-access'] })
      queryClient.invalidateQueries({ queryKey: ['web-access-for-web'] })
      queryClient.invalidateQueries({ queryKey: ['my-web-access'] })
      queryClient.invalidateQueries({ queryKey: ['web-access-check'] })
    },
    onError: (error: Error) => {
      toast.error('Error', {
        description: error.message || 'Failed to remove user from web',
        duration: 5000,
      })
    },
  })
}
