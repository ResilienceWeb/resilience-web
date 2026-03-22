import type { Web } from '@prisma-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'

async function createWebRequest(webData): Promise<{ web: Web }> {
  const response = await fetch('/api/webs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(webData),
  })

  if (!response.ok) {
    const { error } = await response.json()
    throw error
  }

  return response.json()
}

export default function useCreateWeb() {
  const queryClient = useQueryClient()
  const { data, isPending, isSuccess, isError, error, mutate } = useMutation({
    mutationFn: createWebRequest,
    onMutate: (newWeb) => {
      const previousWebs = queryClient.getQueryData([
        'webs',
        { withAdminInfo: false },
      ])
      return { previousWebs, newWeb }
    },
    onSuccess: (_data, variables) => {
      posthog.capture('web-created', { webSlug: variables.slug })
      queryClient.invalidateQueries({
        queryKey: ['webs', { withAdminInfo: false }],
      })
      queryClient.invalidateQueries({ queryKey: ['my-web-access'] })
    },
  })

  return {
    createWeb: mutate,
    data,
    errorMessage: error,
    isPending,
    isSuccess,
    isError,
  }
}
