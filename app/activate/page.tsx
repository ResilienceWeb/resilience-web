'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'

export default function ActivatePage() {
  const session = useSession()

  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  useEffect(() => {
    if (!session?.data) {
      if (email) {
        signIn('email', { email: email })
      }
    }
  }, [session?.data, email])

  return <div suppressHydrationWarning>Activating account</div>
}

export const dynamic = 'force-dynamic'
