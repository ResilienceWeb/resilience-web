'use client'

import { useState } from 'react'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { authClient } from '@auth-client'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import LogoImage from '../../../public/logo.png'
import styles from '../auth.module.css'

export default function SignUp() {
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

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
          {!sent && !isUserAttemptingEdit && !isUserAttemptingPropose && (
            <div className="mb-6 flex justify-center sm:mb-8">
              <p className="text-center text-sm text-gray-600 sm:text-base">
                Welcome! Enter your email to get started:
              </p>
            </div>
          )}

          {!sent &&
            (isUserAttemptingEdit ||
              (isUserAttemptingPropose && (
                <p className="my-6 text-sm sm:my-8 sm:text-base">
                  <span className="font-bold">
                    Everyone can contribute to Resilience Web.
                  </span>{' '}
                  Enter your email to get started.
                </p>
              )))}

          {sent ? (
            <div className="my-6 text-center sm:my-10">
              <h2 className="mb-3 text-xl font-bold sm:text-2xl">
                Check your email
              </h2>
              <p className="text-sm text-gray-700 sm:text-base">
                A sign in link has been sent to your email address.
              </p>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                try {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const { error } = await authClient.signIn.magicLink({
                    email: formData.get('email') as string,
                    callbackURL: redirectTo ?? '/admin',
                  })

                  if (error) throw new Error(error.message)
                  setError('')
                  setSent(true)
                } catch (error) {
                  console.error('[RW] Error signing up:', error)
                  Sentry.captureException(error)
                  setError(
                    error instanceof Error
                      ? error.message
                      : 'An unknown error occurred.',
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
                Sign up
              </Button>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </form>
          )}
        </div>

        {!sent && (
          <div className="w-full max-w-[500px] rounded-xl bg-white p-4 text-sm sm:p-6 sm:text-base">
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
        )}
      </div>
    </div>
  )
}
