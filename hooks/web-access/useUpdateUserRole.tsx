import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { WebRole } from '@prisma/client'

interface UpdateUserRoleParams {
  webId?: number
  webSlug?: string
  userEmail: string
  role: WebRole
}

async function updateUserRoleRequest(params: UpdateUserRoleParams) {
  const response = await fetch('/api/web-access', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update user role')
  }

  return response.json()
}

export default function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUserRoleRequest,
    onSuccess: (data, variables) => {
      toast.success('Success', {
        description: `User ${variables.userEmail} role updated to ${variables.role.toLowerCase()}`,
        duration: 5000,
      })

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['web-access'] })
      queryClient.invalidateQueries({ queryKey: ['web-access-for-web'] })
      queryClient.invalidateQueries({ queryKey: ['my-web-access'] })
      queryClient.invalidateQueries({ queryKey: ['web-access-check'] })
    },
    onError: (error: Error) => {
      toast.error('Error', {
        description: error.message || 'Failed to update user role',
        duration: 5000,
      })
    },
  })
}
