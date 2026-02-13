import type { Web } from '@prisma-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

async function updateWebRequest(webData) {
  const formData = new FormData()
  Object.keys(webData).forEach((key) => formData.append(key, webData[key]))

  const response = await fetch(`/api/webs/${webData.slug}`, {
    method: 'PUT',
    body: formData,
  })

  const data: { web: Web } = await response.json()
  const { web } = data
  return web
}

export default function useUpdateWeb() {
  const queryClient = useQueryClient()

  const { data, isPending, isSuccess, mutate } = useMutation({
    mutationFn: updateWebRequest,
    onMutate: (newWeb) => {
      queryClient.setQueryData(['webs', { webSlug: newWeb.slug }], newWeb)
      // TODO: set query data for list of webs
      return { newWeb }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['webs'],
      })
    },
  })

  return {
    updateWeb: mutate,
    data,
    isPending,
    isSuccess,
  }
}
