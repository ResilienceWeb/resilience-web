import { useAppContext } from '@store/hooks'
import { useWebs } from '@hooks/webs'

export default function useSelectedWebName() {
  const { selectedLocationId } = useAppContext()
  const { webs } = useWebs()

  return webs?.find((s) => s.id === selectedLocationId)?.title
}

