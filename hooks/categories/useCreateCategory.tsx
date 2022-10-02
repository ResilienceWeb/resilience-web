/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQueryClient } from '@tanstack/react-query'

async function createCategoryRequest(categoryData) {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(categoryData),
  })

  const data = await response.json()
  const { category } = data
  return category
}

export default function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation(createCategoryRequest, {
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries(['categories'])
      const previousCategories = queryClient.getQueryData(['categories'])
      queryClient.setQueryData(['categories'], newCategory)
      return { previousCategories }
    },
    onSettled: () => {
      void queryClient.invalidateQueries(['categories'])
    },
  })
}
