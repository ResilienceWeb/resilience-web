import { useQuery } from '@tanstack/react-query'
import { Category } from '@prisma/client'
import useSelectedWebSlug from '@hooks/application/useSelectedWebSlug'

async function fetchCategoriesRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/categories?web=${webSlug}`)
  const { data: categories } = await response.json()
  return categories
}

export default function useCategoriesPublic() {
  const selectedWebSlug = useSelectedWebSlug()
  const {
    data: categories,
    isPending,
    isError,
  } = useQuery<Category[]>({
    queryKey: ['categories', { webSlug: selectedWebSlug }],
    queryFn: fetchCategoriesRequest,
    refetchOnWindowFocus: false,
    enabled: Boolean(selectedWebSlug),
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
