import useMediaQuerySSR from '@hooks/application/useMediaQuerySSR'

const useIsMobile = () => {
  const isMobile = useMediaQuerySSR('(max-width: 760px)')
  return isMobile
}

export default useIsMobile
