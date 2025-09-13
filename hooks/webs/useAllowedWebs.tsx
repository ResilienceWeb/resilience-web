import { useMemo } from 'react'
import { useSession } from '@auth-client'
import useMyWebAccess from '@hooks/web-access/useMyWebAccess'
import useWebs from '@hooks/webs/useWebs'

const useAllowedWebs = () => {
  const { data: session } = useSession()
  const {
    webs,
    isPending: isLoadingWebs,
    isFetching: isFetchingWebs,
  } = useWebs()
  const { accessibleWebs, isPending: isLoadingWebAccess } = useMyWebAccess()

  const allowedWebIds = useMemo(() => {
    return accessibleWebs?.map((web) => web.id) ?? []
  }, [accessibleWebs])

  const allAllowedWebs = useMemo(() => {
    if (!webs) {
      return null
    }

    // Admin users can access all webs
    if (session?.user.role === 'admin') {
      return webs
    }

    // Filter webs based on user's web access
    return webs.filter((web) => allowedWebIds.includes(web.id))
  }, [webs, allowedWebIds, session?.user.role])

  return {
    allowedWebs: allAllowedWebs,
    isLoadingWebs: isLoadingWebs || isFetchingWebs,
    isLoading: isLoadingWebAccess || isFetchingWebs,
  }
}

export default useAllowedWebs
