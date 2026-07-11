import { useLocalStorage } from 'usehooks-ts'
import useAllowedWebs from '@hooks/webs/useAllowedWebs'
import { AppContext } from './AppContext'

const StoreProvider = ({ children }) => {
  const [selectedWebSlug, setSelectedWebSlug] = useLocalStorage<any>(
    'selected-web-slug',
    undefined,
  )

  const { allowedWebs } = useAllowedWebs()

  const selectedWebId = (() => {
    if (allowedWebs) {
      return allowedWebs.find((web) => web.slug === selectedWebSlug)?.id
    }
  })()

  const value = {
    selectedWebSlug,
    setSelectedWebSlug,
    selectedWebId,
  }

  return <AppContext value={value}>{children}</AppContext>
}

export default StoreProvider
