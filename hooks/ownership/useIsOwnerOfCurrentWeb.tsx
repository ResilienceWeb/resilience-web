import { useMemo } from 'react'

import { useAppContext } from '@store/hooks'
import useOwnerships from './useOwnerships'

export default function useIsOwnerOfCurrentWeb() {
  const { selectedWebId } = useAppContext()
  const { ownerships } = useOwnerships()

  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const isOwner = useMemo(() => {
    const webIds = ownerships?.map((o) => o.id)
    return webIds?.includes(selectedWebId)
  }, [ownerships, selectedWebId])

  return isOwner
}

