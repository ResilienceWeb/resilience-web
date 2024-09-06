import { useQuery } from '@tanstack/react-query'
import { Tag } from '@prisma/client'
import useIsAdminMode from '@hooks/application/useIsAdminMode'
import useSelectedWebSlug from '@hooks/application/useSelectedWebSlug'

async function fetchTagsRequest({ queryKey }) {
  const [_key, { webSlug, all }] = queryKey
  const response = await fetch(`/api/tags?web=${webSlug}`)
  const { data: tags } = await response.json()

  return all ? tags : tags.filter((tag) => tag.listings.length > 0)
}

export default function useTags() {
  const isAdminMode = useIsAdminMode()
  const selectedWebSlug = useSelectedWebSlug()
  const {
    data: tags,
    isPending,
    isError,
  } = useQuery<Tag[]>({
    queryKey: ['tags', { webSlug: selectedWebSlug, all: isAdminMode }],
    queryFn: fetchTagsRequest,
    refetchOnWindowFocus: false,
    enabled: selectedWebSlug !== undefined,
  })

  return {
    tags,
    isPending,
    isError,
  }
}
