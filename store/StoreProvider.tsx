import { useMemo } from 'react'
import useLocalStorage from 'use-local-storage'
import useWebs from '@hooks/webs/useWebs'
import useIsAdminMode from '@hooks/application/useIsAdminMode'
import { AppContext } from './AppContext'

const StoreProvider = ({ children }) => {
  const isAdminMode = useIsAdminMode()
  const [selectedWebSlug, setSelectedWebSlug] = useLocalStorage<any>(
    'selected-web-slug',
    undefined,
  )

  const { webs } = useWebs({ published: !isAdminMode })

  const selectedWebId = useMemo(() => {
    if (webs) {
      return webs.find((web) => web.slug === selectedWebSlug)?.id
    }
  }, [selectedWebSlug, webs])

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
