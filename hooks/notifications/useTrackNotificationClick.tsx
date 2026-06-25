import { useMutation } from '@tanstack/react-query'

async function trackClickRequest(id: number) {
  const res = await fetch(`/api/notifications/${id}/click`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to record notification click')
  return res.json()
}

export default function useTrackNotificationClick() {
  const { mutate } = useMutation({
    mutationFn: trackClickRequest,
  })

  return { trackClick: mutate }
}
