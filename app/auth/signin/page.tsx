'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { authClient, ERROR_MESSAGES } from '@auth-client'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import LogoImage from '../../../public/logo.png'
import styles from '../auth.module.css'

export default function SignIn() {
  const router = useRouter()
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const errorCode = searchParams.get('error')

  useEffect(() => {
    if (errorCode) {
      const errorMessage =
        ERROR_MESSAGES[errorCode] || 'An error occurred. Please try again.'
      setError(errorMessage)
    }
  }, [errorCode])

  const isUserAttemptingEdit = redirectTo?.includes('/edit')
  const isUserAttemptingPropose = redirectTo?.includes('/new-listing')

  return (
    <div className={styles.root}>
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mb-6 w-full max-w-[500px] rounded-xl bg-white p-6 sm:mb-8 sm:p-10">
          <div className="mb-4 flex justify-center">
            <div className="relative h-[70px] w-[206px] sm:h-[104px] sm:w-[306px]">
              <Image alt="Resilience Web logo" src={LogoImage} priority />
            </div>
          </div>
          {!isUserAttemptingEdit && !isUserAttemptingPropose && (
            <div className="mb-8 flex justify-center sm:mb-12">
              <h2 className="mt-4 text-xl font-bold sm:text-2xl">Sign in</h2>
            </div>
          )}

          {(isUserAttemptingEdit || isUserAttemptingPropose) && (
            <p className="my-6 text-sm sm:my-8 sm:text-base">
              <span className="font-bold">
                Everyone can contribute to Resilience Web.
              </span>{' '}
              Enter your email to get started.
            </p>
          )}

          <form
            onSubmit={async (e) => {
              try {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const email = formData.get('email') as string
                const { error } = await authClient.emailOtp.sendVerificationOtp(
                  {
                    email,
                    type: 'sign-in',
                  },
                )

                if (error) {
                  Sentry.captureException(error)
                  const errorMessage =
                    error.message || 'Unable to send code. Please try again.'
                  throw new Error(errorMessage)
                }

                sessionStorage.setItem('otp-email', email)
                setError('')

                const verifyUrl = redirectTo
                  ? `/auth/verify-otp?redirectTo=${encodeURIComponent(redirectTo)}`
                  : '/auth/verify-otp'
                router.push(verifyUrl)
              } catch (error) {
                console.error('[RW] Error signing in:', error)
                Sentry.captureException(error)
                setError(
                  error instanceof Error
                    ? error.message
                    : 'Unable to send code. Please try again.',
                )
              }
            }}
          >
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 sm:text-base"
              >
                Email
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
              />
            </div>
            <Button type="submit" className="mt-4 w-full">
              Sign in
            </Button>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </form>
        </div>
        <div className="w-full max-w-[490px] rounded-xl bg-white p-4 text-sm sm:p-6 sm:text-base">
          <span>Not a member of Resilience Web? </span>
          <Link
            href={
              redirectTo
                ? `/auth/signup?redirectTo=${redirectTo}`
                : '/auth/signup'
            }
            className="font-medium text-green-700 transition-colors hover:text-green-600"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
