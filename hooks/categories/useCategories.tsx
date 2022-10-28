import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'
import { Category } from '@prisma/client'

async function fetchCategoriesRequest({ queryKey }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_key, { siteSlug }] = queryKey
  const response = await fetch(`/api/categories?site=${siteSlug}`)
  const { data: categories } = await response.json()
  return categories
}

export default function useCategories(): {
  categories: Category[]
  isLoading: boolean
  isError: boolean
} {
  const { selectedSiteSlug: siteSlug } = useAppContext()
  const {
    data: categories,
    isLoading,
    isError,
  } = useQuery(['categories', { siteSlug }], fetchCategoriesRequest, {
    refetchOnWindowFocus: false,
  })

  return {
    categories,
    isLoading,
    isError,
  }
}
