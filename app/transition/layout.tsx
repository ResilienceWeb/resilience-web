'use client'
import { Suspense } from 'react'
import { QueryParamProvider } from 'use-query-params'
import NextAdapterApp from 'next-query-params/app'
import { ReCaptchaProvider } from 'next-recaptcha-v3'
import '@styles/vis-network-simplified.css'

export default function Layout({ children }) {
  return (
    <Suspense>
      <QueryParamProvider adapter={NextAdapterApp}>
        <ReCaptchaProvider>{children}</ReCaptchaProvider>
      </QueryParamProvider>
    </Suspense>
  )
}
