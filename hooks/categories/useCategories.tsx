import { useQuery } from '@tanstack/react-query'
import { Category } from '@prisma/client'
import { useAppContext } from '@store/hooks'
import { REMOTE_URL } from '@helpers/config'

export async function fetchCategoriesHydrate({ webSlug }) {
  const response = await fetch(`${REMOTE_URL}/api/categories?web=${webSlug}`)
  const { data: categories } = await response.json()
  return categories
}

async function fetchCategoriesRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/categories?web=${webSlug}`)
  const { data: categories } = await response.json()
  return categories
}

export default function useCategories(): {
  categories: Category[]
  isLoading: boolean
  isError: boolean
} {
  const { selectedWebSlug: webSlug } = useAppContext()
  const {
    data: categories,
    isLoading,
    isError,
  } = useQuery(['categories', { webSlug }], fetchCategoriesRequest, {
    refetchOnWindowFocus: false,
  })

  return {
    categories,
    isLoading,
    isError,
  }
}
