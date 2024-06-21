import { useQuery } from '@tanstack/react-query'
import { REMOTE_URL } from '@helpers/config'

export async function fetchWebsHydrate({
  published = false,
  withAdminInfo = false,
} = {}) {
  const BASE_URL =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
      ? 'https://resilienceweb.org.uk'
      : REMOTE_URL

  const response = await fetch(
    `${BASE_URL}/api/webs?withListings=true&withAdminInfo=${withAdminInfo}&published=${published}`,
  )
  const responseJson = await response.json()
  const { data: webs } = responseJson
  return webs || []
}

async function fetchWebsRequest({ queryKey }) {
  const [_key, { published, withAdminInfo }] = queryKey
  const response = await fetch(
    `/api/webs?withListings=true&withAdminInfo=${withAdminInfo}&published=${published}`,
  )
  const responseJson = await response.json()
  const { data: webs } = responseJson
  return webs || []
}

export default function useWebs({
  published = false,
  withAdminInfo = false,
} = {}) {
  const {
    data: webs,
    isPending,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['webs', { published, withAdminInfo }],
    queryFn: fetchWebsRequest,
    refetchOnWindowFocus: false,
  })

  return {
    webs,
    isPending,
    isFetching,
    isError,
  }
}
