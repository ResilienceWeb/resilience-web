/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Location } from '@prisma/client'

async function updateWebRequest(webData) {
  const response = await fetch(`/api/webs/${webData.slug}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(webData),
  })

  const data: { web: null | Location } = await response.json()
  const { web } = data
  return web
}

export default function useUpdateWeb() {
  const queryClient = useQueryClient()

  const { data, isLoading, isSuccess, mutate } = useMutation(updateWebRequest, {
    onMutate: async (newWeb) => {
      await queryClient.cancelQueries(['webs'])
      const previousWebs = queryClient.getQueryData(['webs'])
      // queryClient.setQueryData(['webs'], newWeb)
      return { previousWebs, newWeb }
    },
    // onError: (_err, _newWeb, context) => {
    //   queryClient.setQueryData(
    //     ['webs', context.newWeb.slug],
    //     context.previousWebs,
    //   )
    // },
    onSettled: () => {
      void queryClient.invalidateQueries(['webs'])
    },
  })

  return {
    updateWeb: mutate,
    data,
    isLoading,
    isSuccess,
  }
}

