import { useQuery } from '@tanstack/react-query'
import type { Tag } from '@prisma/client'
import useSelectedWebSlug from '@hooks/application/useSelectedWebSlug'

async function fetchTagsRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/tags?web=${webSlug}`)
  const { data: tags } = await response.json()
  return tags.filter((tag) => tag.listings.length > 0)
}

export default function useTags() {
  const selectedWebSlug = useSelectedWebSlug()
  const {
    data: tags,
    isPending,
    isError,
  } = useQuery<Tag[]>({
    queryKey: ['tags', { webSlug: selectedWebSlug, public: true }],
    queryFn: fetchTagsRequest,
    refetchOnWindowFocus: false,
    enabled: selectedWebSlug !== undefined,
    staleTime: Infinity,
  })

  return {
    tags,
    isPending,
    isError,
  }
}
