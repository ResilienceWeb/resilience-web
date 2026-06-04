import { useQuery } from '@tanstack/react-query'

async function fetchListingsCreated(period: number) {
  const response = await fetch(
    `/api/admin/stats/listings-created?period=${period}`,
  )
  const responseJson = await response.json()
  return responseJson.data
}

export default function useListingsCreated({
  period = 90,
}: { period?: number } = {}) {
  const { data, isPending } = useQuery({
    queryKey: ['listingsCreated', { period }],
    queryFn: () => fetchListingsCreated(period),
    refetchOnWindowFocus: false,
  })

  return {
    listingsCreated: data,
    isPending,
  }
}
