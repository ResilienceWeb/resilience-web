import { useQuery } from '@tanstack/react-query'
import { useSession } from '@auth-client'
import { useAppContext } from '@store/hooks'

async function fetchWebAccessCheckRequest({ queryKey }) {
  const [_key, { webSlug, webId }] = queryKey

  const params = new URLSearchParams()
  if (webSlug) params.set('web', webSlug)
  if (webId) params.set('webId', webId.toString())
  params.set('check', 'edit')

  const response = await fetch(`/api/web-access/check?${params}`)
  if (!response.ok) {
    throw new Error('Failed to check web access')
  }

  const data = await response.json()
  return data.canEdit
}

export default function useCanEditWeb(webSlug?: string, webId?: number) {
  const { data: session, isPending: isLoadingSession } = useSession()
  const { selectedWebSlug, selectedWebId } = useAppContext()

  const targetWebSlug = webSlug || selectedWebSlug
  const targetWebId = webId || selectedWebId

  const {
    data: canEdit,
    isPending,
    isError,
  } = useQuery({
    queryKey: [
      'web-access-check-edit',
      { webSlug: targetWebSlug, webId: targetWebId },
    ],
    queryFn: fetchWebAccessCheckRequest,
    // Not gated on the session: the route reads it from the cookie itself, and
    // waiting for `useSession` to come back put this behind an extra round trip.
    // Every caller lives under /admin, where the layout has already redirected
    // anyone without one.
    enabled: Boolean(targetWebSlug || targetWebId),
    refetchOnWindowFocus: false,
  })

  const hasEditAccess = (() => {
    if (session?.user?.role === 'admin') return true
    return canEdit || false
  })()

  return {
    canEdit: hasEditAccess,
    // A global admin's access comes from the session's role rather than the
    // check, so this isn't answered until the session has landed either.
    isPending: isLoadingSession || isPending,
    isError,
  }
}
