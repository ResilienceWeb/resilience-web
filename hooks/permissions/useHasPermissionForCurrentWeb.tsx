import { useMemo } from 'react'
import { useSession } from 'next-auth/react'

import { useAppContext } from '@store/hooks'
import { usePermissions } from '@hooks/permissions'

export default function useHasPermissionForCurrentWeb() {
  const { permissions } = usePermissions()
  const { selectedWebId } = useAppContext()
  const { data: session, status: sessionStatus } = useSession()

  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const hasPermission = useMemo(
    () => permissions?.webIds?.includes(selectedWebId),
    [permissions?.webIds, selectedWebId],
  )

  return (
    hasPermission || (sessionStatus === 'authenticated' && session.user.admin)
  )
}

