'use client'

import { useState } from 'react'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { signIn } from 'next-auth/react'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import LogoImage from '../../../public/logo.png'
import styles from '../auth.module.css'

export default function SignIn() {
  const [error, setError] = useState('')
  const router = useRouter()
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
          {!isUserAttemptingEdit && !isUserAttemptingPropose && (
            <div className="mb-8 flex justify-center sm:mb-12">
              <h2 className="mt-4 text-xl font-bold sm:text-2xl">Sign in</h2>
            </div>
          )}

          {isUserAttemptingEdit ||
            (isUserAttemptingPropose && (
              <p className="my-6 text-sm sm:my-8 sm:text-base">
                <span className="font-bold">
                  Everyone can contribute to Resilience Web.
                </span>{' '}
                Enter your email to get started.
              </p>
            ))}
          <form
            onSubmit={async (e) => {
              try {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const response = await signIn('nodemailer', {
                  email: formData.get('email'),
                  redirect: false,
                  redirectTo: redirectTo ?? '/admin',
                  callbackUrl: window.location.origin,
                })

                if (response?.error) throw new Error(response.error)
                router.push(response?.url ?? '/')
              } catch (error) {
                console.error('[RW] Error signing in:', error)
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
              Sign in
            </Button>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </form>
        </div>
        <div className="w-full max-w-[500px] rounded-xl bg-white p-4 text-sm sm:p-6 sm:text-base">
          <span>Not a member of Resilience Web? </span>
          <Link
            href="/auth/signup"
            className="font-medium text-green-700 transition-colors hover:text-green-600"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
