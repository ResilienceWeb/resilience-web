'use client'
import { Suspense } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import '@styles/vis-network-simplified.css'

export default function Layout({ children }) {
  return (
    <Suspense>
      <NuqsAdapter>{children}</NuqsAdapter>
    </Suspense>
  )
}
