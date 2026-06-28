'use client'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import StoreProvider from '@store/StoreProvider'

export default function Providers({ children }) {
  return (
    <NuqsAdapter>
      <StoreProvider>{children}</StoreProvider>
    </NuqsAdapter>
  )
}
