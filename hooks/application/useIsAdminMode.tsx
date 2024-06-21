import { useEffect, useState } from 'react'

const useIsAdminMode = () => {
  const [isAdminMode, setIsAdminMode] = useState(false)
  useEffect(() => {
    const isAdminMode = window.location.href.includes('/admin')
    setIsAdminMode(isAdminMode)
  }, [])
  return isAdminMode
}

export default useIsAdminMode
