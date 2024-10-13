import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import useWebs from '@hooks/webs/useWebs'
import usePermissions from '@hooks/permissions/usePermissions'
import useMyOwnerships from '@hooks/ownership/useMyOwnerships'

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

    const allowedWebs = session?.user.admin
      ? webs
      : webs.filter(
          (s) =>
            permissions.webIds?.includes(s.id) ||
            allUniqueWebIds.includes(s.id),
        )

    return allowedWebs
  }, [allUniqueWebIds, permissions, session?.user.admin, webs])

  return {
    allowedWebs: allAllowedWebs,
    isLoadingWebs: isLoadingWebs || isFetchingWebs,
    isLoading: isLoadingPermissions || isLoadingOwnerships || isFetchingWebs,
  }
}

export default useAllowedWebs
