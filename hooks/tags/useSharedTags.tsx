import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

export type SharedTagOption = {
  id: number
  key: string
  label: string
  icon: string | null
  /** Whether the web already uses it. */
  added: boolean
}

async function fetchSharedTagsRequest({ queryKey }) {
  const [_key, { webSlug }] = queryKey
  const response = await fetch(`/api/tags/shared?web=${webSlug}`)
  if (!response.ok) {
    throw new Error(
      `Unable to fetch shared tags for ${webSlug} (${response.status}): ${await response.text()}`,
    )
  }
  const { data } = await response.json()
  return data
}

/** The shared tags the selected web could add, retired ones aside. */
export default function useSharedTags() {
  const { selectedWebSlug: webSlug } = useAppContext()
  const {
    data: sharedTags,
    isPending,
    isError,
    error,
  } = useQuery<SharedTagOption[]>({
    queryKey: ['sharedTags', { webSlug }],
    queryFn: fetchSharedTagsRequest,
    refetchOnWindowFocus: false,
    enabled: webSlug !== undefined,
  })

  useEffect(() => {
    if (error) Sentry.captureException(error)
  }, [error])

  return { sharedTags, isPending, isError }
}
