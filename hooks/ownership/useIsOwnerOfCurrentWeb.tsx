import { useMemo } from 'react'

import { useAppContext } from '@store/hooks'
import useMyOwnerships from './useMyOwnerships'

export default function useIsOwnerOfCurrentWeb() {
  const { selectedWebId } = useAppContext()
  const { ownerships } = useMyOwnerships()

  const isOwner = useMemo(() => {
    const webIds = ownerships?.map((o) => o.id)
    return webIds?.includes(selectedWebId)
  }, [ownerships, selectedWebId])

  return isOwner
}
