import { useQuery } from '@tanstack/react-query'
import { Category } from '@prisma/client'
import { useAppContext } from '@store/hooks'
import { REMOTE_URL } from '@helpers/config'

export async function fetchCategoriesHydrate({ webSlug }) {
  const BASE_URL =
    process.env.VERCEL_ENV === 'preview'
      ? 'https://resilienceweb.org.uk'
      : REMOTE_URL

  const response = await fetch(`${BASE_URL}/api/categories?web=${webSlug}`)
  const { data: categories } = await response.json()
  return categories
}

async function fetchCategoriesRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/categories?web=${webSlug}`)
  const { data: categories } = await response.json()
  return categories
}

export default function useCategories() {
  const { selectedWebSlug: webSlug } = useAppContext()
  const {
    data: categories,
    isPending,
    isError,
  } = useQuery<Category[]>({
    queryKey: ['categories', { webSlug }],
    queryFn: fetchCategoriesRequest,
    refetchOnWindowFocus: false,
  })

  return {
    categories,
    isPending,
    isError,
  }
}
