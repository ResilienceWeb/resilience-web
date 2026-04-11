import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function fetchAnalytics(webSlug: string, period: number) {
  const response = await fetch(
    `/api/analytics/listings?webSlug=${webSlug}&period=${period}`,
  )
  const responseJson = await response.json()
  return responseJson.data
}

export default function useAnalytics(period: number = 30) {
  const { selectedWebSlug } = useAppContext()

  const { data, isPending } = useQuery({
    queryKey: ['analytics', { webSlug: selectedWebSlug, period }],
    queryFn: () => fetchAnalytics(selectedWebSlug, period),
    enabled: Boolean(selectedWebSlug),
    refetchOnWindowFocus: false,
  })

  return {
    analytics: data,
    isPending,
  }
}
