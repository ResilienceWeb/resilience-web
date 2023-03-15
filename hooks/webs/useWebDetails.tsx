import type { Location } from '@prisma/client'
import { REMOTE_URL } from '@helpers/config'
import { useQuery } from '@tanstack/react-query'

export async function fetchWebDetailsRequest(isSSR = false) {
  const response = await fetch(
    isSSR ? `${REMOTE_URL}/api/web-details` : '/api/web-details',
  )
  const data: { webDetails: Location[] } = await response.json()
  const { webDetails } = data
  return webDetails || []
}

export default function useWebDetails() {
  const {
    data: webDetails,
    isLoading,
    isError,
  } = useQuery(['webDetails'], () => fetchWebDetailsRequest(false), {
    refetchOnWindowFocus: false,
  })

  return {
    webDetails,
    isLoading,
    isError,
  }
}
