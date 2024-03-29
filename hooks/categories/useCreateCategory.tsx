import { useMutation, useQueryClient } from '@tanstack/react-query'

async function createCategoryRequest(categoryData) {
  const { label, ...otherProperties } = categoryData
  const categoryDataWithCapitalisedLabel = {
    label: label.charAt(0).toUpperCase() + label.slice(1),
    ...otherProperties,
  }

  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(categoryDataWithCapitalisedLabel),
  })

  const data = await response.json()
  const { category } = data
  return category
}

export default function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCategoryRequest,
    onMutate: (newCategory) => {
      const previousCategories = queryClient.getQueryData(['categories'])
      queryClient.setQueryData(['categories'], newCategory)
      return { previousCategories }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['categories'],
      })
    },
  })
}
