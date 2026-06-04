import { useQuery } from '@tanstack/react-query'

async function fetchUserSignups(period: number) {
  const response = await fetch(`/api/admin/stats/user-signups?period=${period}`)
  const responseJson = await response.json()
  return responseJson.data
}

export default function useUserSignups({
  period = 90,
}: { period?: number } = {}) {
  const { data, isPending } = useQuery({
    queryKey: ['userSignups', { period }],
    queryFn: () => fetchUserSignups(period),
    refetchOnWindowFocus: false,
  })

  return {
    signups: data,
    isPending,
  }
}
