/**
 * Accepts query string in format like Window.matchMedia()
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
 *  EXP: '(max-width: 600px)' '(min-width: 600px)'
 *
 *
 * Return Boolean, based on query params
 */
import { useLayoutEffect, useEffect, useState, useCallback } from 'react'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

const useMediaQuerySSR = (queryStr) => {
  const [targetW, setTargetW] = useState(false)

  const updateTarget = useCallback((e) => {
    if (e.matches) {
      setTargetW(true)
    } else {
      setTargetW(false)
    }
  }, [])

  useIsomorphicLayoutEffect(() => {
    const media = window.matchMedia(queryStr)

    media.addEventListener('change', updateTarget)

    // Check on mount (callback is not called until a change occurs)
    if (media.matches) {
      setTargetW(true)
    }
    // clean up
    return () => media.removeEventListener('change', updateTarget)
  }, [])

  return targetW
}

export default useMediaQuerySSR
