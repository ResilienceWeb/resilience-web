'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../auth.module.css'

export default function VerifyRequest() {
  const router = useRouter()

  useEffect(() => {
    // Check if email is in session storage (indicates OTP flow)
    const email = sessionStorage.getItem('auth-email')
    if (email) {
      // Redirect to new OTP verification page
      router.push('/auth/verify-otp')
    }
  }, [router])

  return (
    <div className={styles.root}>
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center rounded-xl bg-white p-12">
          <h1 className="mb-4 text-2xl font-bold">Check your email</h1>
          <p className="mb-4">
            A sign in link has been sent to your email address.
          </p>
          <div className="mt-4 rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-semibold">Note:</p>
            <p>
              This page is maintained for backward compatibility with existing
              magic links. New authentication requests use OTP codes instead.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
