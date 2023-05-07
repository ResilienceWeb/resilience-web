import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'
import { Tag } from '@prisma/client'

async function fetchTagsRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/tags?web=${webSlug}`)
  const { data: tags } = await response.json()

  return tags.filter((tag) => tag.listings.length > 0)
}

export default function useTags(): {
  tags: Tag[]
  isLoading: boolean
  isError: boolean
} {
  const { selectedWebSlug: webSlug } = useAppContext()
  const {
    data: tags,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['tags', { webSlug }],
    queryFn: fetchTagsRequest,
    refetchOnWindowFocus: false,
  })

  return {
    tags,
    isLoading,
    isError,
  }
}
