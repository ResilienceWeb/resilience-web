'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/legacy/image'
import { Button } from '@components/ui/button'
import LogoImage from '../../../public/logo.png'
import styles from '../auth.module.scss'

export default function SignIn() {
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const isUserAttemptingEdit = redirectTo?.includes('/edit')

  return (
    <div className={styles.root}>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-white p-10 rounded-xl mb-8 w-[500px]">
          <div className="mb-4 flex justify-center">
            <Image
              alt="Resilience Web logo"
              src={LogoImage}
              width="306"
              height="104"
            />
          </div>
          {!isUserAttemptingEdit && (
            <div className="flex justify-center mb-12">
              <h2 className="text-2xl font-bold mt-4">
                Sign in
              </h2>
            </div>
          )}

          {isUserAttemptingEdit && (
            <p className="my-8">
              <span className="font-bold">
                Everyone can edit listings on Resilience Web.
              </span>{' '}
              Just enter your email to start contributing.
            </p>
          )}
          <form
            onSubmit={async (e) => {
              try {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const response = await signIn('email', {
                  email: formData.get('email'),
                  redirect: false,
                  redirectTo: redirectTo ?? '/admin',
                  callbackUrl: window.location.origin,
                })

                if (response?.error) throw new Error(response.error)
                router.push(response?.url ?? '/')
              } catch (error) {
                setError(
                  error instanceof Error ? error.message : 'An unknown error occurred.',
                )
              }
            }}
          >
            <label htmlFor="email" className="block">
              Email
              <input
                type="email"
                id="email"
                name="email"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <Button
              type="submit"
              className="w-full mt-2"
            >
              Sign in
            </Button>
            {error && <p className="mt-2 text-red-600">{error}</p>}
          </form>
        </div>
        <div className="bg-white p-6 rounded-xl w-[500px]">
          <span>Not a member of Resilience Web?{' '}</span>
          <Link
            href="/auth/signup"
            className="text-green-700 hover:text-green-600"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
