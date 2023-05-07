import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'
import { Tag } from '@prisma/client'
import { REMOTE_URL } from '@helpers/config'

export async function fetchTagsHydrate({ webSlug }) {
  const response = await fetch(`${REMOTE_URL}/api/tags?web=${webSlug}`)
  const { data: tags } = await response.json()
  return tags
}

async function fetchTagsRequest({ queryKey }) {
  const [_key, { webSlug, all }] = queryKey
  const response = await fetch(`/api/tags?web=${webSlug}`)
  const { data: tags } = await response.json()

  return all ? tags : tags.filter((tag) => tag.listings.length > 0)
}

export default function useTags(): {
  tags: Tag[]
  isLoading: boolean
  isError: boolean
} {
  const { selectedWebSlug: webSlug, isAdminMode } = useAppContext()
  const {
    data: tags,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['tags', { webSlug, all: isAdminMode }],
    queryFn: fetchTagsRequest,
    refetchOnWindowFocus: false,
  })

  return {
    tags,
    isLoading,
    isError,
  }
}
