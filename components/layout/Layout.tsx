import React, { memo, useMemo } from 'react'
import { useRouter } from 'next/router'
import { Flex, SlideFade, useBreakpointValue } from '@chakra-ui/react'
import Nav from '@components/nav'
import Footer from '@components/footer'
import AlertBanner from '@components/alert-banner'
import styles from './Layout.module.scss'

const Layout = ({
  applyPostStyling,
  children,
}: {
  applyPostStyling?: boolean
  children: React.ReactNode
}) => {
  const router = useRouter()

  const isHomepage = useMemo(() => router.pathname === '/', [router.pathname])

  return (
    <>
      <Nav />
      <SlideFade in>
        <Flex
          className={applyPostStyling ? styles.root : null}
          minHeight={useBreakpointValue({
            base: 'calc(100vh - 186px)',
            lg: 'calc(100vh - 140px)',
          })}
          alignItems="center"
          flexDirection="column"
          backgroundColor="gray.50"
        >
          {isHomepage && (
            <AlertBanner
              content="Join us on a seminar series to imagine a thriving, sustainable future for Cambridge, rooted in community resilience! What works well now – and where are the gaps?"
              type="info"
              url="https://www.transitioncambridge.org/wiki/TTResilienceWeb/TogetherWeCan"
            />
          )}
          {children}
        </Flex>
      </SlideFade>
      <Footer />
    </>
  )
}

export default memo(Layout)
