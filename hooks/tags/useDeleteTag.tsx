import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function deleteTagRequest({ id }) {
  const response = await fetch(`/api/tags/${id}`, {
    method: 'DELETE',
  })

  const data = await response.json()
  const { tag } = data
  return tag
}

export default function useDeleteTag() {
  const queryClient = useQueryClient()
  const { selectedWebSlug: webSlug } = useAppContext()

  return useMutation({
    mutationFn: deleteTagRequest,
    onMutate: (data) => {
      queryClient.setQueryData(['tags', { webSlug, id: data.id }], data)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['tags', { webSlug }],
      })
    },
  })
}
