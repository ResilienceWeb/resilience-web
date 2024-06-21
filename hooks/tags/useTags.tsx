import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'
import { Tag } from '@prisma/client'
import { REMOTE_URL } from '@helpers/config'
import { useIsAdminMode } from '@hooks/application'

export async function fetchTagsHydrate({ webSlug }) {
  const BASE_URL =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
      ? 'https://resilienceweb.org.uk'
      : REMOTE_URL

  const response = await fetch(`${BASE_URL}/api/tags?web=${webSlug}`)
  const { data: tags } = await response.json()
  return tags
}

async function fetchTagsRequest({ queryKey }) {
  const [_key, { webSlug, all }] = queryKey
  const response = await fetch(`/api/tags?web=${webSlug}`)
  const { data: tags } = await response.json()

  return all ? tags : tags.filter((tag) => tag.listings.length > 0)
}

export default function useTags() {
  const isAdminMode = useIsAdminMode()
  const { selectedWebSlug: webSlug } = useAppContext()
  const {
    data: tags,
    isPending,
    isError,
  } = useQuery<Tag[]>({
    queryKey: ['tags', { webSlug, all: isAdminMode }],
    queryFn: fetchTagsRequest,
    refetchOnWindowFocus: false,
  })

  return {
    tags,
    isPending,
    isError,
  }
}
