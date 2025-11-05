'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { authClient, ERROR_MESSAGES } from '@auth-client'
import { Button } from '@components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@components/ui/input-otp'
import LogoImage from '../../../public/logo.png'
import styles from '../auth.module.css'

const MAX_RESEND_ATTEMPTS = 3
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

interface ResendAttempt {
  timestamp: number
}

export default function VerifyOTP() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendAttempts, setResendAttempts] = useState<ResendAttempt[]>([])
  const [timeUntilRetry, setTimeUntilRetry] = useState(0)

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('otp-email')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      router.push('/auth/signin')
    }
  }, [router])

  useEffect(() => {
    const storedAttempts = sessionStorage.getItem('otp-resend-attempts')
    if (storedAttempts) {
      try {
        const attempts = JSON.parse(storedAttempts) as ResendAttempt[]
        setResendAttempts(attempts)
      } catch (e) {
        console.error('[RW] Error parsing resend attempts:', e)
      }
    }
  }, [])

  // Calculate if rate limited and time until retry
  const calculateRateLimit = useCallback(() => {
    const now = Date.now()
    const recentAttempts = resendAttempts.filter(
      (attempt) => now - attempt.timestamp < RATE_LIMIT_WINDOW_MS,
    )

    if (recentAttempts.length >= MAX_RESEND_ATTEMPTS) {
      const oldestAttempt = recentAttempts[0]
      const timeUntilReset =
        RATE_LIMIT_WINDOW_MS - (now - oldestAttempt.timestamp)
      return { isRateLimited: true, timeUntilReset }
    }

    return { isRateLimited: false, timeUntilReset: 0 }
  }, [resendAttempts])

  // Update countdown timer
  useEffect(() => {
    const { isRateLimited, timeUntilReset } = calculateRateLimit()
    if (isRateLimited) {
      setTimeUntilRetry(Math.ceil(timeUntilReset / 1000))

      const interval = setInterval(() => {
        const { timeUntilReset: newTimeUntilReset } = calculateRateLimit()
        const seconds = Math.ceil(newTimeUntilReset / 1000)
        setTimeUntilRetry(seconds)

        if (seconds <= 0) {
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [resendAttempts, calculateRateLimit])

  const handleOtpChange = (value: string) => {
    setOtp(value)
    setError('')
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      const { error: verifyError } = await authClient.signIn.emailOtp({
        email,
        otp,
      })

      if (verifyError) {
        Sentry.captureException(verifyError, {
          extra: {
            email: email,
            errorMessage: verifyError.message,
          },
        })

        // Map common error messages
        let errorMessage = 'An error occurred. Please try again.'
        if (
          verifyError.message?.includes('invalid') ||
          verifyError.message?.includes('Invalid')
        ) {
          errorMessage =
            (ERROR_MESSAGES as any).INVALID_OTP ||
            'Invalid code. Please check and try again.'
        } else if (
          verifyError.message?.includes('expired') ||
          verifyError.message?.includes('Expired')
        ) {
          errorMessage =
            (ERROR_MESSAGES as any).OTP_EXPIRED ||
            'This code has expired. Please request a new one.'
        } else if (verifyError.message) {
          errorMessage = verifyError.message
        }

        setError(errorMessage)
        setIsVerifying(false)
        return
      }

      // Clear session storage on success
      sessionStorage.removeItem('otp-email')
      sessionStorage.removeItem('otp-resend-attempts')

      // Redirect to callback URL or admin
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

  const handleResend = async () => {
    const { isRateLimited } = calculateRateLimit()

    if (isRateLimited) {
      const minutes = Math.ceil(timeUntilRetry / 60)
      setError(
        `Too many attempts. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`,
      )
      return
    }

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

      // Track resend attempt
      const newAttempts = [...resendAttempts, { timestamp: Date.now() }]
      setResendAttempts(newAttempts)
      sessionStorage.setItem('otp-resend-attempts', JSON.stringify(newAttempts))

      // Clear OTP input
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

  const { isRateLimited } = calculateRateLimit()
  const remainingAttempts =
    MAX_RESEND_ATTEMPTS -
    resendAttempts.filter(
      (attempt) => Date.now() - attempt.timestamp < RATE_LIMIT_WINDOW_MS,
    ).length

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
              disabled={isResending || isRateLimited}
              className="mt-1"
            >
              {isResending
                ? 'Sending...'
                : isRateLimited
                  ? `Wait ${Math.ceil(timeUntilRetry / 60)} minute${Math.ceil(timeUntilRetry / 60) > 1 ? 's' : ''}`
                  : 'Resend code'}
            </Button>
            {!isRateLimited && remainingAttempts < MAX_RESEND_ATTEMPTS && (
              <p className="mt-1 text-xs text-gray-500">
                {remainingAttempts} resend{remainingAttempts !== 1 ? 's' : ''}{' '}
                remaining
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
