import { useMemo } from 'react'
import { useAppContext } from '@store/hooks'
import { useSession } from '@auth-client'
import usePermissions from '@hooks/permissions/usePermissions'

export default function useHasPermissionForCurrentWeb() {
  const { permissions } = usePermissions()
  const { selectedWebId } = useAppContext()
  const { data: session } = useSession()

  const hasPermission = useMemo(
    () => permissions?.webIds?.includes(selectedWebId),
    [permissions?.webIds, selectedWebId],
  )

  return hasPermission || (session && session?.user.role === 'admin')
}
