/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query'

async function createTagRequest(tagData) {
  const response = await fetch('/api/tags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(tagData),
  })

  const data = await response.json()
  const { tag } = data
  return tag
}

export default function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTagRequest,
    onMutate: async (newTag) => {
      await queryClient.cancelQueries({
        queryKey: ['tags'],
      })
      const previousTags = queryClient.getQueryData(['tags'])
      queryClient.setQueryData(['tags'], newTag)
      return { previousTags }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['tags'],
      })
    },
  })
}
