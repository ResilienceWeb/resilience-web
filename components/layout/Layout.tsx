'use client'

import React, { memo } from 'react'
import { usePathname } from 'next/navigation'
import AlertBanner from '@components/alert-banner'
import Footer from '@components/footer'
import Nav from '@components/nav'
import styles from './Layout.module.css'

interface LayoutProps {
  children: React.ReactNode
  applyPostStyling?: boolean
  hideFooter?: boolean
  hideNav?: boolean
  hideBorder?: boolean
}

const Layout = ({
  children,
  applyPostStyling = false,
  hideFooter = false,
  hideNav = false,
  hideBorder = false,
}: LayoutProps) => {
  const pathname = usePathname()

  return (
    <>
      {!hideNav && <Nav />}
      <main
        className={`flex min-h-[calc(100vh-186px)] flex-col items-center md:min-h-[calc(100vh-328px)] ${!hideBorder ? 'border-t border-t-gray-200' : ''} `}
      >
        {pathname === '/' && (
          <AlertBanner
            content="Join our online monthly Assembly. Click here to read more."
            type="info"
            url="https://www.eventbrite.com/e/resilience-web-monthly-assembly-tickets-1220916868219?aff=oddtdtcreator"
          />
        )}
        <div
          className={`flex w-full max-w-7xl flex-col items-center justify-center px-4 pt-6 pb-8 ${applyPostStyling ? styles.root : ''} `}
        >
          {children}
        </div>
      </main>
      {!hideFooter && <Footer />}
    </>
  )
}

export default memo(Layout)
