import { useMemo } from 'react'
import { useSession } from '@auth-client'
import useMyOwnerships from '@hooks/ownership/useMyOwnerships'
import usePermissions from '@hooks/permissions/usePermissions'
import useWebs from '@hooks/webs/useWebs'

const useAllowedWebs = () => {
  const { data: session } = useSession()
  const {
    webs,
    isPending: isLoadingWebs,
    isFetching: isFetchingWebs,
  } = useWebs()
  const { permissions, isPending: isLoadingPermissions } = usePermissions()
  const { ownerships, isPending: isLoadingOwnerships } = useMyOwnerships()

  const allUniqueWebIds = useMemo(() => {
    if (!permissions && !ownerships) {
      return []
    }

    const allWebIds =
      permissions?.fullPermissionData?.listings.map((l) => l.webId) ?? []
    const ownedWebsIds = ownerships?.map((o) => o.id) ?? []

    return Array.from(new Set([...allWebIds, ...ownedWebsIds]))
  }, [ownerships, permissions])

  const allAllowedWebs = useMemo(() => {
    if (!webs || !permissions) {
      return null
    }

    const allowedWebs =
      session?.user.role === 'admin'
        ? webs
        : webs.filter(
            (s) =>
              permissions.webIds?.includes(s.id) ||
              allUniqueWebIds.includes(s.id),
          )

    return allowedWebs
  }, [allUniqueWebIds, permissions, session?.user.role, webs])

  return {
    allowedWebs: allAllowedWebs,
    isLoadingWebs: isLoadingWebs || isFetchingWebs,
    isLoading: isLoadingPermissions || isLoadingOwnerships || isFetchingWebs,
  }
}

export default useAllowedWebs
