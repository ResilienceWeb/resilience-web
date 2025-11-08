import type { Category } from '@prisma-client'
import { useQuery } from '@tanstack/react-query'

async function fetchCategoriesRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/categories?web=${webSlug}`)
  const { data: categories } = await response.json()
  return categories
}

export default function useCategoriesPublic({ webSlug }) {
  const {
    data: categories,
    isPending,
    isError,
  } = useQuery<Category[]>({
    queryKey: ['categories', { webSlug }],
    queryFn: fetchCategoriesRequest,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: Boolean(webSlug),
  })

  return {
    categories: categories?.sort((category1, category2) => {
      if (category1.label < category2.label) {
        return -1
      }
      if (category1.label > category2.label) {
        return 1
      }
      return 0
    }),
    isPending,
    isError,
  }
}
