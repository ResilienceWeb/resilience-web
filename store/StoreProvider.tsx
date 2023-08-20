import { useEffect, useState, useMemo } from 'react'
import useLocalStorage from 'use-local-storage'
import { useMediaQuerySSR } from '@hooks/application'
import { AppContext } from '@store/AppContext'

const DEFAULT_SELECTED_WEB = 'cambridge-city'

const StoreProvider = ({ children }) => {
  const isMobile = useMediaQuerySSR('(max-width: 760px)')
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [selectedWebSlug, setSelectedWebSlug] = useLocalStorage(
    'selected-web',
    DEFAULT_SELECTED_WEB,
  )
  const [webs, setWebs] = useState([])
  const [subdomain, setSubdomain] = useState<string>()

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

  async function fetchWebs() {
    const response = await fetch('/api/webs')

    if (response.status === 200) {
      const data = await response.json()
      const { webs } = data
      setWebs(webs)
    } else {
      console.error('Failed to fetch webs in StoreProvider')
    }
  }

  useEffect(() => {
    void fetchWebs()
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

  return (
    <AppContext.Provider
      value={{
        isAdminMode,
        isMobile,
        selectedWebSlug,
        setSelectedWebSlug,
        selectedWebId,
        webs,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export default StoreProvider
