/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Location } from '@prisma/client'

async function updateWebRequest(webData) {
  const formData = new FormData()
  Object.keys(webData).forEach((key) => formData.append(key, webData[key]))

  const response = await fetch(`/api/webs/${webData.slug}`, {
    method: 'POST',
    body: formData,
  })

  const data: { web: null | Location } = await response.json()
  const { web } = data
  return web
}

export default function useUpdateWeb() {
  const queryClient = useQueryClient()

  const { data, isLoading, isSuccess, mutate } = useMutation(updateWebRequest, {
    onMutate: async (newWeb) => {
      await queryClient.cancelQueries(['webs', newWeb.id])
      queryClient.setQueryData(['webs', newWeb.id], newWeb)
      return { newWeb }
    },
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

