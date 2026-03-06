import { useQuery } from '@tanstack/react-query'

async function fetchAdminStats() {
  const response = await fetch('/api/admin/stats')
  const responseJson = await response.json()
  return responseJson.data
}

export default function useAdminStats() {
  const { data, isPending } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchAdminStats,
    refetchOnWindowFocus: false,
  })

  return {
    stats: data,
    isPending,
  }
}
