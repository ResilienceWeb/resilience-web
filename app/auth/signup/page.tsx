'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { authClient } from '@auth-client'
import { ERROR_MESSAGES } from '@auth-client'
import { Button } from '@components/ui/button'
import { Checkbox } from '@components/ui/checkbox'
import { Input } from '@components/ui/input'
import LogoImage from '../../../public/logo.png'
import styles from '../auth.module.css'

export default function SignUp() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const errorCode = searchParams.get('error')

  const errorFromParams = errorCode
    ? ERROR_MESSAGES[errorCode] || 'An error occurred. Please try again.'
    : ''
  const displayError = error || errorFromParams

  const isUserAttemptingEdit = redirectTo?.includes('/edit')
  const isUserAttemptingPropose = redirectTo?.includes('/new-listing')

  // Clear any name left over from an abandoned signup so it can't be
  // applied to an unrelated session later on.
  useEffect(() => {
    sessionStorage.removeItem('otp-name')
    sessionStorage.removeItem('otp-newsletter')
  }, [])

  return (
    <div className={styles.root}>
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mb-6 w-full max-w-125 rounded-xl bg-white p-6 sm:mb-8 sm:p-10">
          <div className="mb-4 flex justify-center">
            <div className="relative h-[70px] w-[206px] sm:h-[104px] sm:w-[306px]">
              <Image alt="Resilience Web logo" src={LogoImage} priority />
            </div>
          </div>
          {!isUserAttemptingEdit && !isUserAttemptingPropose && (
            <div className="mb-6 flex justify-center sm:mb-8">
              <p className="text-center text-sm text-gray-600 sm:text-base">
                Welcome! Enter your email to get started:
              </p>
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
                const name = (formData.get('name') as string)?.trim()
                const email = formData.get('email') as string

                const checkResponse = await fetch('/api/users/check-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email }),
                })
                const { exists } = await checkResponse.json()

                if (exists) {
                  setError(
                    'An account with this email already exists. Please sign in instead.',
                  )
                  return
                }

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
                if (name) {
                  sessionStorage.setItem('otp-name', name)
                } else {
                  sessionStorage.removeItem('otp-name')
                }
                if (subscribeToNewsletter) {
                  sessionStorage.setItem('otp-newsletter', 'true')
                } else {
                  sessionStorage.removeItem('otp-newsletter')
                }
                setError('')
                const verifyUrl = redirectTo
                  ? `/auth/verify-otp?redirectTo=${encodeURIComponent(redirectTo)}`
                  : '/auth/verify-otp'
                router.push(verifyUrl)
              } catch (error) {
                console.error('[RW] Error signing up:', error)
                Sentry.captureException(error)
                setError(
                  error instanceof Error
                    ? error.message
                    : 'Unable to send code. Please try again.',
                )
              }
            }}
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 sm:text-base"
              >
                Name{' '}
                <span className="text-xs font-normal text-gray-400">
                  (optional)
                </span>
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. Jane Smith"
              />
            </div>
            <div className="mt-3 flex flex-col gap-1">
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
                placeholder="e.g. jane@example.com"
                required
              />
            </div>
            <div className="mt-4 flex items-start gap-2">
              <Checkbox
                id="newsletter"
                checked={subscribeToNewsletter}
                onCheckedChange={(checked) =>
                  setSubscribeToNewsletter(checked === true)
                }
                className="mt-0.5"
              />
              <label
                htmlFor="newsletter"
                className="text-sm leading-snug text-gray-700 cursor-pointer"
              >
                Subscribe to our newsletter to keep up with news and updates
                from Resilience Web.
              </label>
            </div>
            <Button type="submit" className="mt-4 w-full">
              Sign up
            </Button>
            {displayError && (
              <p className="mt-3 text-sm text-red-600">{displayError}</p>
            )}
          </form>
        </div>

        <div className="w-full max-w-[490px] rounded-xl bg-white p-4 text-sm sm:p-6 sm:text-base">
          <span>Already have an account? </span>
          <Link
            href={
              redirectTo
                ? `/auth/signin?redirectTo=${redirectTo}`
                : '/auth/signin'
            }
            className="font-medium text-green-700 transition-colors hover:text-green-600"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
