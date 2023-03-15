import { useAppContext } from '@store/hooks'
import { useWebListings } from '@hooks/webs'

export default function useSelectedWebName() {
  const { selectedWebId } = useAppContext()
  const { webListings } = useWebListings()

  return webListings.find((s) => s.id === selectedWebId)?.title
}

