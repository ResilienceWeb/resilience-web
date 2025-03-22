'use client'
import { Suspense } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ReCaptchaProvider } from 'next-recaptcha-v3'
import '@styles/vis-network-simplified.css'

export default function Layout({ children }) {
  return (
    <Suspense>
      <NuqsAdapter>
        <ReCaptchaProvider>{children}</ReCaptchaProvider>
      </NuqsAdapter>
    </Suspense>
  )
}
