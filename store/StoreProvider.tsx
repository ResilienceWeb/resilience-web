import { useEffect, useState, useMemo } from 'react'
import useLocalStorage from 'use-local-storage'
import { AppContext } from '@store/AppContext'
import { useWebs } from '@hooks/webs'
import { useIsAdminMode } from '@hooks/application'

const StoreProvider = ({ children }) => {
  const isAdminMode = useIsAdminMode()
  const [selectedWebSlug, setSelectedWebSlug] = useLocalStorage<string>(
    'selected-web-slug',
    undefined,
  )
  const [subdomain, setSubdomain] = useState<string>()

  const { webs } = useWebs({ published: !isAdminMode })

  useEffect(() => {
    const hostname = window.location.hostname
    if (!hostname.includes('.')) {
      return
    }

    setSubdomain(hostname.split('.')[0])
  }, [])

  useEffect(() => {
    if (subdomain && subdomain !== 'resilienceweb') {
      setSelectedWebSlug(subdomain)
    }
  }, [setSelectedWebSlug, subdomain])

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
