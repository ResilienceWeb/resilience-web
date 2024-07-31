import React, { memo } from 'react'
// import { usePathname } from 'next/navigation'
import { Flex, SlideFade, useBreakpointValue } from '@chakra-ui/react'
import Nav from '@components/nav'
import Footer from '@components/footer'
// import AlertBanner from '@components/alert-banner'
import styles from './Layout.module.scss'

const Layout = ({
  applyPostStyling,
  children,
}: {
  applyPostStyling?: boolean
  children: React.ReactNode
}) => {
  // const pathname = usePathname()

  // const isHomepage = useMemo(() => pathname === '/', [pathname])

  return (
    <>
      <Nav />
      <SlideFade in>
        <Flex
          className={applyPostStyling ? styles.root : undefined}
          minHeight={useBreakpointValue({
            base: 'calc(100vh - 186px)',
            lg: 'calc(100vh - 140px)',
          })}
          alignItems="center"
          flexDirection="column"
        >
          {/* {isHomepage && (
            <AlertBanner
              content="We are currently undertaking a big technical migration and you might notice some issues. Please bear with us for a few days until we finalise all the changes."
              type="info"
              // url="https://www.transitioncambridge.org/wiki/TTResilienceWeb/TogetherWeCan"
            />
          )} */}

          {children}
        </Flex>
      </SlideFade>
      <Footer />
    </>
  )
}

export default memo(Layout)
