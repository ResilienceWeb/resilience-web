/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query'

async function updateCategoryRequest(categoryData) {
  const response = await fetch('/api/categories', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(categoryData),
  })

  const data = await response.json()
  const { category } = data
  return category
}

export default function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation(updateCategoryRequest, {
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries(['categories'])
      const previousCategories = queryClient.getQueryData(['categories'])
      queryClient.setQueryData(['categories'], newCategory)
      return { previousCategories, newCategory }
    },
    onError: (err, newCategory, context) => {
      queryClient.setQueryData(
        ['categories', context.newCategory.id],
        context.previousCategories,
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries(['categories'])
    },
  })
}
