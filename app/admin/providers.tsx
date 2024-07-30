'use client'
import StoreProvider from '@store/StoreProvider'

export default function Providers({ children }) {
  return <StoreProvider>{children}</StoreProvider>
}
