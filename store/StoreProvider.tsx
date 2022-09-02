import { useEffect, useState, useMemo } from 'react'
import { useMediaQuerySSR } from '@hooks/application'
import { AppContext } from '@store/AppContext'

const DEFAULT_SELECTED_SITE = 'cambridge-city'

const StoreProvider = ({ children }) => {
  const isMobile = useMediaQuerySSR('(max-width: 760px)')
  const [selectedSiteSlug, setSelectedSiteSlug] = useState(
    DEFAULT_SELECTED_SITE,
  )
  const [sites, setSites] = useState([])
  const [subdomain, setSubdomain] = useState<string>()

  useEffect(() => {
    const hostname = window.location.hostname
    if (!hostname.includes('.')) {
      return
    }

    setSubdomain(hostname.split('.')[0])
  }, [])

  useEffect(() => {
    async function fetchSites() {
      const response = await fetch('/api/sites')
      const data = await response.json()
      const { sites } = data
      setSites(sites)
    }
    void fetchSites()
  }, [])

  useEffect(() => {
    if (subdomain && subdomain !== 'resilienceweb') {
      setSelectedSiteSlug(subdomain)
    }
  }, [subdomain])

  const selectedLocationId = useMemo(() => {
    if (sites) {
      return sites.find((site) => site.slug === selectedSiteSlug)?.id
    }
  }, [selectedSiteSlug, sites])

  return (
    <AppContext.Provider
      value={{
        isMobile,
        selectedSiteSlug,
        setSelectedSiteSlug,
        selectedLocationId,
        sites,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export default StoreProvider
