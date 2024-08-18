import { useEffect, useState } from 'react'

const useSelectedWebSlug = () => {
  const [subdomain, setSubdomain] = useState<string>()
  const [selectedWebSlug, setSelectedWebSlug] = useState<string>()

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

  return selectedWebSlug
}

export default useSelectedWebSlug
