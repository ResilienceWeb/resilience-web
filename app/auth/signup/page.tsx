'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@components/ui/button'
import Image from 'next/legacy/image'
import LogoImage from '../../../public/logo.png'
import styles from '../auth.module.scss'

export default function SignUp() {
  const [error, setError] = useState('')
  const router = useRouter()

  return (
    <div className={styles.root}>
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mb-6 w-full max-w-[500px] rounded-xl bg-white p-6 sm:mb-8 sm:p-10">
          <div className="mb-4 flex justify-center">
            <div className="relative h-[70px] w-[206px] sm:h-[104px] sm:w-[306px]">
              <Image
                alt="Resilience Web logo"
                src={LogoImage}
                width="306"
                height="104"
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="mb-6 flex justify-center sm:mb-8">
            <p className="text-center text-sm text-gray-600 sm:text-base">
              Welcome! Enter your email to get started:
            </p>
          </div>
          <form
            onSubmit={async (e) => {
              try {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const response = await signIn('email', {
                  email: formData.get('email'),
                  redirect: false,
                  callbackUrl: window.location.origin,
                })

                if (response?.error) throw new Error(response.error)
                router.push(response?.url ?? '/')
              } catch (error) {
                setError(
                  error instanceof Error
                    ? error.message
                    : 'An unknown error occurred.',
                )
              }
            }}
          >
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 sm:text-base"
            >
              Email
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </label>
            <Button type="submit" className="mt-4 w-full">
              Sign up
            </Button>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </form>
        </div>
        <div className="w-full max-w-[500px] rounded-xl bg-white p-4 text-sm sm:p-6 sm:text-base">
          <span>Already have an account? </span>
          <Link
            href="/auth/signin"
            className="font-medium text-green-700 transition-colors hover:text-green-600"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
