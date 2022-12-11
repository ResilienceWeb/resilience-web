import { useAppContext } from '@store/hooks'
import { useSites } from '@hooks/sites'

export default function useSelectedWebName() {
  const { selectedLocationId } = useAppContext()
  const { sites } = useSites()

  return sites?.find((s) => s.id === selectedLocationId)?.title
}

