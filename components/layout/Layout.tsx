import React, { memo, useMemo } from 'react'
import { useRouter } from 'next/router'
import classnames from 'classnames'
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
                    className={classnames(applyPostStyling && styles.root)}
                    mt={'1rem'}
                    minHeight={useBreakpointValue({
                        base: 'calc(100vh - 186px)',
                        lg: 'calc(100vh - 140px)',
                    })}
                    alignItems="center"
                    flexDirection="column"
                >
                    {/* {isHomepage && (
						<AlertBanner
							content="Join our Pecha Kucha event on the 24th March: Stories from the Cambridge Resilience Webs"
							type="info"
							url="https://www.eventbrite.co.uk/e/stories-from-the-cambridge-resilience-webs-tickets-260401135807"
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
