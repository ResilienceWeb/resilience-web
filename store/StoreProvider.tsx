import { useEffect, useState, useMemo } from 'react'
import useLocalStorage from 'use-local-storage'
import { useMediaQuerySSR } from '@hooks/application'
import { AppContext } from '@store/AppContext'
import { useWebs } from '@hooks/webs'

const DEFAULT_SELECTED_WEB = 'cambridge-city'

const StoreProvider = ({ children }) => {
  const isMobile = useMediaQuerySSR('(max-width: 760px)')
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [selectedWebSlug, setSelectedWebSlug] = useLocalStorage(
    'selected-web',
    DEFAULT_SELECTED_WEB,
  )
  const [subdomain, setSubdomain] = useState<string>()

  const { webs } = useWebs()

  useEffect(() => {
    const hostname = window.location.hostname
    if (!hostname.includes('.')) {
      return
    }

    setSubdomain(hostname.split('.')[0])
  }, [])

  useEffect(() => {
    const isAdminMode = window.location.href.includes('/admin')
    setIsAdminMode(isAdminMode)
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
      isAdminMode,
      isMobile,
      selectedWebSlug,
      setSelectedWebSlug,
      selectedWebId,
      webs,
    }),
    [
      isAdminMode,
      isMobile,
      selectedWebId,
      selectedWebSlug,
      setSelectedWebSlug,
      webs,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default StoreProvider
