import { useMutation } from '@tanstack/react-query'
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
  const { data, isPending, isSuccess, isError, error, mutate } = useMutation({
    mutationFn: createWebRequest,
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
