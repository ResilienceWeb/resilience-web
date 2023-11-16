import type { Web } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { REMOTE_URL } from '@helpers/config'

export async function fetchWebsHydrate({ published = false } = {}) {
  const BASE_URL =
    process.env.VERCEL_ENV === 'preview'
      ? 'https://resilienceweb.org.uk'
      : REMOTE_URL

  const response = await fetch(
    `${BASE_URL}/api/webs?withListings=true&published=${published}`,
  )
  const data: { webs: Web[] } = await response.json()
  const { webs } = data
  return webs || []
}

async function fetchWebsRequest({ queryKey }) {
  const [_key, { published }] = queryKey
  const response = await fetch(
    `/api/webs?withListings=true&published=${published}`,
  )
  const responseJson: { data: Web[] } = await response.json()
  const { data: webs } = responseJson
  return webs || []
}

export default function useWebs({ published = false } = {}) {
  const {
    data: webs,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['webs', { published }],
    queryFn: fetchWebsRequest,
    refetchOnWindowFocus: false,
  })

  return {
    webs,
    isPending,
    isError,
  }
}
