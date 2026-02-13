import { useMutation, useQueryClient } from '@tanstack/react-query'

async function updateTagRequest(tagData) {
  const response = await fetch(`/api/tags/${tagData.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(tagData),
  })

  const data = await response.json()
  const { tag } = data
  return tag
}

export default function useUpdateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTagRequest,
    onMutate: (newTag) => {
      const previousTags = queryClient.getQueryData(['tags'])
      queryClient.setQueryData(['tags'], newTag)
      return { previousTags, newTag }
    },
    onError: (_err, _newTag, context) => {
      queryClient.setQueryData(
        ['tags', context?.newTag.id],
        context?.previousTags,
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['tags'],
      })
    },
  })
}
