import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'
import useWeb from '@hooks/webs/useWeb'

const featureListingRequest = async ({
  id,
  webId,
}: {
  id: number
  webId: number
}) => {
  const response = await fetch(`api/listing/${id}/feature`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ webId }),
  })

  const data = await response.json()
  const { listing } = data
  return listing
}

export const unfeatureListingRequest = async ({
  id,
  webId,
}: {
  id: number
  webId: number
}) => {
  const response = await fetch(`api/listing/${id}/unfeature`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ webId }),
  })

  const data = await response.json()
  const { listing } = data
  return listing
}

export default function useFeatureListing() {
  const queryClient = useQueryClient()
  const { selectedWebSlug: webSlug } = useAppContext()
  const { web } = useWeb({ webSlug })

  const { mutate: featureListing } = useMutation({
    mutationFn: (id: number) =>
      featureListingRequest({ id, webId: web?.id }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['listings', 'list', { webSlug }],
      })
    },
  })

  const { mutate: unfeatureListing } = useMutation({
    mutationFn: (id: number) =>
      unfeatureListingRequest({ id, webId: web?.id }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['listings', 'list', { webSlug }],
      })
    },
  })

  return {
    featureListing,
    unfeatureListing,
  }
}
