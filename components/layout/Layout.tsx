'use client'

import React, { memo } from 'react'
import { usePathname } from 'next/navigation'
import AlertBanner from '@components/alert-banner'
import Footer from '@components/footer'
import Nav from '@components/nav'

interface LayoutProps {
  children: React.ReactNode
  webs?: any[]
  hideBorder?: boolean
}

const Layout = ({ children, webs, hideBorder = false }: LayoutProps) => {
  const pathname = usePathname()

  return (
    <>
      <Nav webs={webs} />
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
          className={`flex w-full max-w-6xl flex-col items-center justify-center px-4 pt-4 pb-8} `}
        >
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default memo(Layout)
