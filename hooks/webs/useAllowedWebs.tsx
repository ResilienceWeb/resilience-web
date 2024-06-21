import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useWebs } from '@hooks/webs'
import { usePermissions } from '@hooks/permissions'
import { useMyOwnerships } from '@hooks/ownership'

const useAllowedWebs = () => {
  const { data: session } = useSession()
  const { webs } = useWebs()
  const {
    permissions,
    isPending: isLoadingPermissions,
    isFetching: isFetchingPermissions,
  } = usePermissions()
  const {
    ownerships,
    isPending: isLoadingOwnerships,
    isFetching: isFetchingOwnerships,
  } = useMyOwnerships()

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
    if (!webs || !permissions) return []

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
    isLoading:
      isLoadingPermissions ||
      isFetchingPermissions ||
      isLoadingOwnerships ||
      isFetchingOwnerships,
  }
}

export default useAllowedWebs
