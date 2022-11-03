import { useMemo } from 'react'

import { useAppContext } from '@store/hooks'
import { usePermissions } from '@hooks/permissions'

export default function useHasPermissionForCurrentSite() {
  const { permissions } = usePermissions()
  const { selectedLocationId } = useAppContext()

  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const hasPermission = useMemo(
    () => permissions?.siteIds?.includes(selectedLocationId),
    [permissions?.siteIds, selectedLocationId],
  )

  return hasPermission
}

