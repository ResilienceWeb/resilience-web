'use client'

import { Suspense } from 'react'
import '@styles/vis-network-simplified.css'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function Layout({ children }) {
  return (
    <Suspense>
      <NuqsAdapter>{children}</NuqsAdapter>
    </Suspense>
  )
}
