/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function deleteCategoryRequest({ id }) {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
  })

  const data = await response.json()
  const { category } = data
  return category
}

export default function useDeleteCategory() {
  const queryClient = useQueryClient()
  const { selectedWebSlug: webSlug } = useAppContext()

  return useMutation({
    mutationFn: deleteCategoryRequest,
    onMutate: (data) => {
      queryClient.setQueryData(['categories', { webSlug, id: data.id }], data)
    },
    onSettled: () => {
      void queryClient.invalidateQueries(['categories', { webSlug }])
    },
  })
}
