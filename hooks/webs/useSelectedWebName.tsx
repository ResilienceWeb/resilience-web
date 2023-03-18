import { useAppContext } from '@store/hooks'
import { useWebs } from '@hooks/webs'

export default function useSelectedWebName() {
  const { selectedWebId } = useAppContext()
  const { webs, isLoading } = useWebs()

  if (isLoading) {
    return ''
  } else {
    return webs.find((s) => s.id === selectedWebId)?.title
  }

}

