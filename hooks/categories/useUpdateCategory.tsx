import { useMutation, useQueryClient } from '@tanstack/react-query'

async function updateCategoryRequest(categoryData) {
  const response = await fetch(`/api/categories/${categoryData.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(categoryData),
  })

  const responseJson = await response.json()
  return responseJson.data
}

export default function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCategoryRequest,
    onMutate: (newCategory) => {
      const previousCategories = queryClient.getQueryData(['categories'])
      queryClient.setQueryData(['categories'], newCategory)
      return { previousCategories, newCategory }
    },
    onError: (_err, _newCategory, context) => {
      queryClient.setQueryData(
        ['categories', context?.newCategory.id],
        context?.previousCategories,
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['categories'],
      })
    },
  })
}
