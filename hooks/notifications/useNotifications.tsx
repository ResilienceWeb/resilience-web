import { useQuery } from '@tanstack/react-query'
import { useSession } from '@auth-client'

export type NotificationItem = {
  id: number
  title: string
  body: string
  url: string | null
  urlLabel: string | null
  severity: 'info' | 'warning' | 'critical'
  createdAt: string
  seenAt: string | null
  clickedAt: string | null
}

async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch('/api/notifications')
  if (!res.ok) throw new Error('Failed to load notifications')
  const json = await res.json()
  return (json?.items ?? []) as NotificationItem[]
}

export default function useNotifications() {
  const { data: session } = useSession()

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: Boolean(session),
    staleTime: 30_000,
  })

  const items = data ?? []
  const unreadCount = items.filter((n) => !n.seenAt).length

  return {
    items,
    unreadCount,
    isPending,
    isError,
    error,
    refetch,
  }
}
