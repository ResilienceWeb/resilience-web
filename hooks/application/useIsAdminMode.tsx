import { useMemo } from 'react'

const useIsAdminMode = () => {
  const isAdminMode = useMemo(() => {
    return window.location.href.includes('/admin')
  }, [])
  return isAdminMode
}

export default useIsAdminMode
