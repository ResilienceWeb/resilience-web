'use client'
import React, { memo } from 'react'
import { usePathname } from 'next/navigation'
import Nav from '@components/nav'
import Footer from '@components/footer'
import AlertBanner from '@components/alert-banner'
import styles from './Layout.module.scss'

interface LayoutProps {
  children: React.ReactNode
  applyPostStyling?: boolean
  hideFooter?: boolean
  hideNav?: boolean
  hideBorder?: boolean
}

const Layout = memo(function Layout({
  children,
  applyPostStyling = false,
  hideFooter = false,
  hideNav = false,
  hideBorder = false,
}: LayoutProps) {
  const pathname = usePathname()

  return (
    <>
      {!hideNav && <Nav />}
      <main
        className={`flex min-h-[calc(100vh-186px)] flex-col items-center md:min-h-[calc(100vh-328px)] ${!hideBorder ? 'border-t border-t-gray-200' : ''} `}
      >
        {pathname === '/' && (
          <AlertBanner
            content="Join our online monthly Assembly every first Wednesday of the month, at midday. Click here to read more."
            type="info"
            url="https://www.eventbrite.com/e/resilience-web-monthly-assembly-tickets-1220916868219?aff=oddtdtcreator"
          />
        )}
        <div
          className={`mx-auto max-w-7xl px-4 py-8 ${applyPostStyling ? styles.root : ''} `}
        >
          {children}
        </div>
      </main>
      {!hideFooter && <Footer />}
    </>
  )
})

export default Layout
