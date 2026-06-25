import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { NotificationItem } from './useNotifications'

async function markSeenRequest(ids: number[]) {
  const res = await fetch('/api/notifications/seen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error('Failed to mark notifications as seen')
  return res.json()
}

export default function useMarkNotificationsSeen() {
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: markSeenRequest,
    // Optimistically clear the unread badge so the count updates immediately.
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      const previous = queryClient.getQueryData<NotificationItem[]>([
        'notifications',
      ])
      const seenAt = new Date().toISOString()
      queryClient.setQueryData<NotificationItem[]>(['notifications'], (old) =>
        (old ?? []).map((n) =>
          ids.includes(n.id) && !n.seenAt ? { ...n, seenAt } : n,
        ),
      )
      return { previous }
    },
    onError: (_err, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous)
      }
    },
  })

  return { markSeen: mutate }
}
