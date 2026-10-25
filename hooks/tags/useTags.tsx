import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function fetchTagsRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/tags?web=${webSlug}`)
  // The route answers a failure with plain text, which would otherwise surface
  // as a JSON parse error, or as `tags` silently being undefined.
  if (!response.ok) {
    throw new Error(
      `Unable to fetch tags for ${webSlug} (${response.status}): ${await response.text()}`,
    )
  }
  const { data: tags } = await response.json()

  return tags
}

export default function useTags({
  webSlug: webSlugOverride,
}: { webSlug?: string } = {}) {
  const { selectedWebSlug } = useAppContext()
  const webSlug = webSlugOverride ?? selectedWebSlug
  const {
    data: tags,
    isPending,
    isError,
    error,
  } = useQuery<TagWithListings[]>({
    queryKey: ['tags', { webSlug }],
    queryFn: fetchTagsRequest,
    refetchOnWindowFocus: false,
    enabled: webSlug !== undefined,
  })

  // Reported once the retries have run out, rather than once per attempt.
  useEffect(() => {
    if (error) Sentry.captureException(error)
  }, [error])

  return {
    tags,
    isPending,
    isError,
  }
}
