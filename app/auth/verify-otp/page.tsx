'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { authClient, ERROR_MESSAGES } from '@auth-client'
import type { AUTH_ERROR_CODE } from '@auth-client'
import { Button } from '@components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@components/ui/input-otp'
import LogoImage from '../../../public/logo.png'
import styles from '../auth.module.css'

export default function VerifyOTP() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const [otp, setOtp] = useState('')
  const email = useMemo(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('otp-email') || ''
    }
    return ''
  }, [])
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!email) {
      router.push('/auth/signin')
    }
  }, [email, router])

  const verifyOtp = async (otpValue: string) => {
    if (otpValue.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      const { error: verifyError } = await authClient.signIn.emailOtp({
        email,
        otp: otpValue,
      })

      if (verifyError) {
        Sentry.captureException(verifyError, {
          extra: {
            email: email,
            errorMessage: verifyError.message,
          },
        })

        const errorMessage =
          ERROR_MESSAGES[verifyError.code as AUTH_ERROR_CODE] ||
          verifyError.message ||
          'An error occurred. Please try again.'

        setError(errorMessage)
        setIsVerifying(false)
        return
      }

      // Clear session storage on success
      sessionStorage.removeItem('otp-email')

      router.push(redirectTo ?? '/admin')
    } catch (error) {
      console.error('[RW] Error verifying OTP:', error)
      Sentry.captureException(error, {
        extra: {
          email: email,
        },
      })
      setError('An unexpected error occurred. Please try again.')
      setIsVerifying(false)
    }
  }

  const handleOtpChange = (value: string) => {
    setOtp(value)
    setError('')

    // Auto-verify when all 6 digits are entered
    if (value.length === 6) {
      verifyOtp(value)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    await verifyOtp(otp)
  }

  const handleResend = async () => {
    setIsResending(true)
    setError('')

    try {
      const { error: resendError } =
        await authClient.emailOtp.sendVerificationOtp({
          email,
          type: 'sign-in',
        })

      if (resendError) {
        Sentry.captureException(resendError, {
          extra: {
            email: email,
          },
        })
        setError('Unable to send code. Please try again.')
        setIsResending(false)
        return
      }

      setOtp('')
      setError('')
      setIsResending(false)
    } catch (error) {
      console.error('[RW] Error resending OTP:', error)
      Sentry.captureException(error, {
        extra: {
          email: email,
        },
      })
      setError('Unable to send code. Please try again.')
      setIsResending(false)
    }
  }

  return (
    <div className={styles.root}>
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mb-6 w-full max-w-[490px] rounded-xl bg-white p-6 sm:mb-8 sm:p-10">
          <div className="mb-4 flex justify-center">
            <div className="relative h-[70px] w-[206px] sm:h-[104px] sm:w-[306px]">
              <Image alt="Resilience Web logo" src={LogoImage} priority />
            </div>
          </div>

          <div className="mb-8 flex flex-col items-center justify-center sm:mb-12">
            <h2 className="mt-4 text-xl font-bold sm:text-2xl">
              Check your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 sm:text-base">
              We sent a 6-digit code to
            </p>
            <p className="mt-1 text-center text-sm text-gray-600 font-medium sm:text-base">
              {email}
            </p>
          </div>

          <form onSubmit={handleVerify}>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                disabled={isVerifying}
                autoFocus
                pattern={REGEXP_ONLY_DIGITS}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              className="mt-4 w-full"
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 sm:text-base">
              Didn&apos;t receive the code?
            </p>
            <Button
              type="button"
              variant="link"
              onClick={handleResend}
              disabled={isResending}
              className="mt-1"
            >
              {isResending ? 'Sending...' : 'Resend code'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
