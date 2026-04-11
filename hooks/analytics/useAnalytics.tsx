import { useQuery } from '@tanstack/react-query'
import { useAppContext } from '@store/hooks'

async function fetchAnalytics(webSlug: string, period: number) {
  const response = await fetch(
    `/api/analytics/listings?webSlug=${webSlug}&period=${period}`,
  )
  const responseJson = await response.json()
  return responseJson.data
}

export default function useAnalytics({
  webSlug: webSlugOverride,
  period = 30,
}: {
  webSlug?: string
  period?: number
} = {}) {
  const { selectedWebSlug } = useAppContext()
  const webSlug = webSlugOverride ?? selectedWebSlug

  const { data, isPending } = useQuery({
    queryKey: ['analytics', { webSlug, period }],
    queryFn: () => fetchAnalytics(webSlug, period),
    enabled: Boolean(webSlug),
    refetchOnWindowFocus: false,
  })

  return {
    analytics: data,
    isPending,
  }
}
