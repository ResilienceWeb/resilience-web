import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export type AdminNotification = {
  id: number
  title: string
  body: string
  url: string | null
  urlLabel: string | null
  severity: 'info' | 'warning' | 'critical'
  audience: 'ALL' | 'ADMINS' | 'WEB'
  targetWebIds: number[]
  publishAt: string | null
  expiresAt: string | null
  createdAt: string
  createdBy: { name: string | null; email: string | null } | null
  seenCount: number
  clickedCount: number
  audienceSize: number
}

export type NotificationPayload = {
  title: string
  body: string
  url?: string
  urlLabel?: string
  severity: 'info' | 'warning' | 'critical'
  audience: 'ALL' | 'ADMINS' | 'WEB'
  targetWebIds?: number[]
  publishAt?: string | null
  expiresAt?: string | null
}

const QUERY_KEY = ['admin', 'notifications']

async function fetchAdminNotifications(): Promise<AdminNotification[]> {
  const res = await fetch('/api/admin/notifications')
  if (!res.ok) throw new Error('Failed to load notifications')
  const json = await res.json()
  return json.notifications ?? []
}

export function useAdminNotifications() {
  const { data, isPending, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAdminNotifications,
  })

  return { notifications: data ?? [], isPending, isError }
}

async function parseError(res: Response, fallback: string) {
  const json = await res.json().catch(() => ({}))
  return new Error(json?.error ?? fallback)
}

export function useCreateNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: NotificationPayload) => {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw await parseError(res, 'Failed to create notification')
      return res.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: NotificationPayload & { id: number }) => {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw await parseError(res, 'Failed to update notification')
      return res.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw await parseError(res, 'Failed to delete notification')
      return res.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
