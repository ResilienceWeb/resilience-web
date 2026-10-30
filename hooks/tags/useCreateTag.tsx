import { useMutation, useQueryClient } from '@tanstack/react-query'

async function createTagRequest(tagData) {
  const response = await fetch('/api/tags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(tagData),
  })

  // Refused when the label is a shared tag's, which the caller should say
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({}))
    throw new Error(error ?? 'Unable to create tag')
  }

  const result = await response.json()
  return result.data
}

export default function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTagRequest,
    onMutate: (newTag) => {
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
