import type { Web } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const updateWebFeatureRequest = async (webData) => {
  const response = await fetch(`/api/webs/${webData.slug}`, {
    method: 'PATCH',
    body: JSON.stringify(webData),
  })

  const data: { web: Web } = await response.json()
  const { web } = data
  return web
}

export default function useUpdateWebFeature() {
  const queryClient = useQueryClient()

  const { data, isPending, isSuccess, mutate } = useMutation({
    mutationFn: updateWebFeatureRequest,
    onMutate: (newWeb) => {
      queryClient.setQueryData(['webs', { webSlug: newWeb.slug }], newWeb)
      return { newWeb }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['webs'],
      })
    },
  })

  return {
    updateWebFeature: mutate,
    data,
    isPending,
    isSuccess,
  }
}
