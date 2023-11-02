import { useAppContext } from '@store/hooks'
import { useWebs } from '@hooks/webs'

export default function useSelectedWebName() {
  const { selectedWebId } = useAppContext()
  const { webs, isPending } = useWebs()

  if (isPending) {
    return ''
  } else {
    return webs.find((s) => s.id === selectedWebId)?.title
  }
}
