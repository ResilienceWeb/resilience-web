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
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="mb-8 w-[500px] rounded-xl bg-white p-12">
          <div className="mb-4 flex justify-center">
            <Image
              alt="Resilience Web logo"
              src={LogoImage}
              width="306"
              height="104"
            />
          </div>
          <div className="mb-8 flex justify-center">
            <p className="text-md">Welcome! Enter your email to get started:</p>
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
            <label htmlFor="email" className="block">
              Email
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <Button type="submit" className="mt-2 w-full">
              Sign up
            </Button>
            {error && <p className="mt-2 text-red-600">{error}</p>}
          </form>
        </div>
        <div className="w-[500px] rounded-xl bg-white p-6">
          Not a member of Resilience Web?{' '}
          <Link
            href="/auth/signin"
            className="text-green-700 hover:text-green-600"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
