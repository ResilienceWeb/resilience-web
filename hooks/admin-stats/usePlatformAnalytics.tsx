import { useQuery } from '@tanstack/react-query'

async function fetchPlatformAnalytics(period: number) {
  const response = await fetch(`/api/admin/stats/analytics?period=${period}`)
  const responseJson = await response.json()
  return responseJson.data
}

export default function usePlatformAnalytics({
  period = 90,
}: { period?: number } = {}) {
  const { data, isPending } = useQuery({
    queryKey: ['platformAnalytics', { period }],
    queryFn: () => fetchPlatformAnalytics(period),
    refetchOnWindowFocus: false,
  })

  return {
    analytics: data,
    isPending,
  }
}
