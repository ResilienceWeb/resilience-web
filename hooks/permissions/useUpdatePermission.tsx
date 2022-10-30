/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query'

async function updatePermissionRequest(permissionData) {
  const response = await fetch('/api/permissions', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(permissionData),
  })

  const data = await response.json()
  const { permission } = data
  return permission
}

export default function useUpdatePermission() {
  const queryClient = useQueryClient()

  return useMutation(updatePermissionRequest, {
    onMutate: async (newPermission) => {
      await queryClient.cancelQueries([
        'permission',
        { email: newPermission.email },
      ])
      const previousPermissions = queryClient.getQueryData([
        'permission',
        { email: newPermission.email },
      ])
      queryClient.setQueryData(
        ['permission', { email: newPermission.email }],
        newPermission,
      )
      return { previousPermissions, newPermission }
    },
    onError: (_err, _newCategory, context) => {
      queryClient.setQueryData(
        ['permission', context.newPermission.email],
        context.previousPermissions,
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries(['permission'])
    },
  })
}

