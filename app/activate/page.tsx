'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { Spinner } from '@components/ui/spinner'

export default function ActivatePage() {
  const session = useSession()

  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  useEffect(() => {
    if (!session?.data) {
      if (email) {
        signIn('nodemailer', {
          email: email,
          redirectTo: '/admin?firstTime=true',
        })
      }
    }
  }, [session?.data, email])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner />
        <div className="mb-36">
          <h1 className="text-xl font-semibold text-gray-900">
            Activating account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we set up your account...
          </p>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
