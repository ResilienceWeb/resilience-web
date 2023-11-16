import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Web } from '@prisma/client'

async function createWebRequest(webData): Promise<Web> {
  const response = await fetch('/api/webs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(webData),
  })

  const data = await response.json()
  const { web } = data
  return web
}

export default function useCreateWeb() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createWebRequest,
    onMutate: (newWeb) => {
      const previousWebs = queryClient.getQueryData(['webs'])
      queryClient.setQueryData(['webs', newWeb.id], newWeb)
      return { previousWebs, newWeb }
    },
  })
}
