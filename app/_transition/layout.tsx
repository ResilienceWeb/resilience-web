'use client'
import { Suspense } from 'react'
import '@styles/vis-network-simplified.css'
import { ReCaptchaProvider } from 'next-recaptcha-v3'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function Layout({ children }) {
  return (
    <Suspense>
      <NuqsAdapter>
        <ReCaptchaProvider>{children}</ReCaptchaProvider>
      </NuqsAdapter>
    </Suspense>
  )
}
