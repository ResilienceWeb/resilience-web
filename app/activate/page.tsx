'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'

export default function ActivatePage() {
  const { data: session } = useSession()

  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  useEffect(() => {
    if (!session) {
      if (email) {
        signIn('email', { email: email })
      } else {
        // signIn().catch((e) => console.error(e))
      }
    }
  }, [session, email])

  return <div suppressHydrationWarning>Activating account</div>
}
