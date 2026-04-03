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
  const [targetW, setTargetW] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(queryStr).matches
  })

  const updateTarget = useCallback((e) => {
    setTargetW(e.matches)
  }, [])

  useIsomorphicLayoutEffect(() => {
    const media = window.matchMedia(queryStr)

    media.addEventListener('change', updateTarget)

    // clean up
    return () => media.removeEventListener('change', updateTarget)
  }, [])

  return targetW
}

export default useMediaQuerySSR
