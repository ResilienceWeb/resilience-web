import { useMediaQuerySSR } from '@hooks/application'

const useIsMobile = () => {
  const isMobile = useMediaQuerySSR('(max-width: 760px)')
  return isMobile
}

export default useIsMobile
