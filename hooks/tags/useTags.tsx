import type { Tag } from '@prisma-client'
import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function fetchTagsRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/tags?web=${webSlug}`)
  const { data: tags } = await response.json()

  return tags
}

export default function useTags() {
  const { selectedWebSlug: webSlug } = useAppContext()
  const {
    data: tags,
    isPending,
    isError,
  } = useQuery<Tag[]>({
    queryKey: ['tags', { webSlug }],
    queryFn: fetchTagsRequest,
    refetchOnWindowFocus: false,
    enabled: webSlug !== undefined,
  })

  return {
    tags,
    isPending,
    isError,
  }
}
