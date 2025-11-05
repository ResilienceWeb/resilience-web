'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, authClient } from '@auth-client'
import { Spinner } from '@components/ui/spinner'

export default function ActivatePage() {
  const router = useRouter()
  const session = useSession()

  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  useEffect(() => {
    if (!session?.data) {
      if (email) {
        authClient.emailOtp.sendVerificationOtp({
          email,
          type: 'sign-in',
        })
        sessionStorage.setItem('otp-email', email)
        router.push('/auth/verify-otp?redirectTo=/admin?firstTime=true')
      }
    }
  }, [session?.data, email, router])

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
