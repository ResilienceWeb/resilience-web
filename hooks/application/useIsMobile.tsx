import useMediaQuerySSR from '@hooks/application/useMediaQuerySSR'

const useIsMobile = () => {
  const isMobile = useMediaQuerySSR('(max-width: 767px)')
  return isMobile
}

export default useIsMobile
