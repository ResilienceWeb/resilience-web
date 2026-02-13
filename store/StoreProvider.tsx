import { useMemo } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import useAllowedWebs from '@hooks/webs/useAllowedWebs'
import { AppContext } from './AppContext'

const StoreProvider = ({ children }) => {
  const [selectedWebSlug, setSelectedWebSlug] = useLocalStorage<any>(
    'selected-web-slug',
    undefined,
  )

  const { allowedWebs } = useAllowedWebs()

  const selectedWebId = useMemo(() => {
    if (allowedWebs) {
      return allowedWebs.find((web) => web.slug === selectedWebSlug)?.id
    }
  }, [selectedWebSlug, allowedWebs])

  const value = useMemo(
    () => ({
      selectedWebSlug,
      setSelectedWebSlug,
      selectedWebId,
    }),
    [selectedWebId, selectedWebSlug, setSelectedWebSlug],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default StoreProvider
