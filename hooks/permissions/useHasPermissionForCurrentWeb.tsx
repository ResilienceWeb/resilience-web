import { useMemo } from 'react'
import { useSession } from 'next-auth/react'

import { useAppContext } from '@store/hooks'
import { usePermissions } from '@hooks/permissions'

export default function useHasPermissionForCurrentWeb() {
  const { permissions } = usePermissions()
  const { selectedLocationId } = useAppContext()
  const { data: session, status: sessionStatus } = useSession()

  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const hasPermission = useMemo(
    () => permissions?.webIds?.includes(selectedLocationId),
    [permissions?.webIds, selectedLocationId],
  )

  return (
    hasPermission || (sessionStatus === 'authenticated' && session.user.admin)
  )
}

