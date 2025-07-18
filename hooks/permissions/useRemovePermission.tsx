import { useAppContext } from '@store/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'

async function removePermissionRequest({ userEmail, webId }) {
  const response = await fetch('/api/permissions/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify({
      userEmail,
      webId,
    }),
  })

  const responseJson = await response.json()
  return responseJson
}

export default function useRemovePermission() {
  const queryClient = useQueryClient()
  const { selectedWebSlug: webSlug } = useAppContext()

  const { mutate } = useMutation({
    mutationFn: removePermissionRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['current-web-permissions', { webSlug }],
      })
    },
  })

  return {
    removePermission: mutate,
  }
}
