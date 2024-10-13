import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Web } from '@prisma/client'

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
    onSuccess: (data, _variables, context) => {
      queryClient.setQueryData(
        ['webs', { withAdminInfo: false }],
        [...(context.previousWebs as Web[]), data.web],
      )
      queryClient.invalidateQueries({ queryKey: ['my-ownerships'] })
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
