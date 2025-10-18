import type { Tag } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'

async function fetchTagsRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/tags?web=${webSlug}`)
  const { data: tags } = await response.json()
  return tags.filter((tag) => tag.listings.length > 0)
}

export default function useTagsPublic({ webSlug }) {
  const {
    data: tags,
    isPending,
    isError,
  } = useQuery<Tag[]>({
    queryKey: ['tags', { webSlug, public: true }],
    queryFn: fetchTagsRequest,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  })

  return {
    tags,
    isPending,
    isError,
  }
}
