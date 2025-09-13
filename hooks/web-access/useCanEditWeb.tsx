import { useMemo } from 'react'
import { useAppContext } from '@store/hooks'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@auth-client'

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
  const { data: session } = useSession()
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
    enabled: Boolean(session && (targetWebSlug || targetWebId)),
    refetchOnWindowFocus: false,
  })

  const hasEditAccess = useMemo(() => {
    if (session?.user?.role === 'admin') return true
    return canEdit || false
  }, [canEdit, session?.user?.role])

  return {
    canEdit: hasEditAccess,
    isPending,
    isError,
  }
}
