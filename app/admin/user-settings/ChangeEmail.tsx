'use client'

import { useState } from 'react'
import * as Sentry from '@sentry/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { toast } from 'sonner'
import * as z from 'zod'
import { authClient, ERROR_MESSAGES } from '@auth-client'
import type { AUTH_ERROR_CODE } from '@auth-client'
import { Button } from '@components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@components/ui/input-otp'
import { Label } from '@components/ui/label'

const EXPECTED_ERRORS = ['INVALID_OTP', 'OTP_EXPIRED', 'TOO_MANY_ATTEMPTS']

// Better Auth reports a taken address with a bare message rather than a code.
// This is also what someone hits when the address has a pending invite, since
// accepting an invite creates the account ahead of the first sign-in.
const EMAIL_IN_USE_MESSAGE =
  'Another account already uses this email address. If you need the two accounts merged, get in touch at info@resilienceweb.org.uk.'

function errorMessage(error: { code?: string; message?: string }) {
  if (error.message === 'Email already in use') return EMAIL_IN_USE_MESSAGE
  return (
    ERROR_MESSAGES[error.code as AUTH_ERROR_CODE] ||
    'Something went wrong. Please try again.'
  )
}

function report(
  action: string,
  error: { code?: string; status?: number; message?: string },
) {
  if (EXPECTED_ERRORS.includes(error.code ?? '')) return
  if (error.message === 'Email already in use') return
  Sentry.captureException(new Error(error.message ?? `${action} failed`), {
    extra: { code: error.code, status: error.status },
  })
}

export default function ChangeEmail({
  currentEmail,
}: {
  currentEmail: string
}) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [newEmail, setNewEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reset = () => {
    setStep('email')
    setNewEmail('')
    setOtp('')
    setError('')
    setIsSubmitting(false)
  }

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) reset()
  }

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = newEmail.trim().toLowerCase()

    if (!z.email().safeParse(email).success) {
      setError('Please enter a valid email address.')
      return
    }
    if (email === currentEmail.toLowerCase()) {
      setError('This is already your email address.')
      return
    }

    setIsSubmitting(true)
    setError('')
    const { error: requestError } =
      await authClient.emailOtp.requestEmailChange({ newEmail: email })
    setIsSubmitting(false)

    if (requestError) {
      report('Requesting email change', requestError)
      setError(errorMessage(requestError))
      return
    }

    setNewEmail(email)
    setStep('code')
  }

  const confirm = async (code: string) => {
    if (code.length !== 6) {
      setError('Please enter the 6-digit code.')
      return
    }

    setIsSubmitting(true)
    setError('')
    const { error: changeError } = await authClient.emailOtp.changeEmail({
      newEmail,
      otp: code,
    })

    if (changeError) {
      report('Changing email', changeError)
      setError(errorMessage(changeError))
      setIsSubmitting(false)
      return
    }

    // The email OTP client refreshes the session after requesting a change but
    // not after completing one, so ask for it here.
    authClient.$store.notify('$sessionSignal')
    await queryClient.invalidateQueries({ queryKey: ['user'] })
    toast.success(`Your email address is now ${newEmail}`)
    onOpenChange(false)
  }

  const onOtpChange = (value: string) => {
    setOtp(value)
    setError('')
    if (value.length === 6) confirm(value)
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Label className="text-sm font-semibold">Email address</Label>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm">{currentEmail}</span>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              Change email
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change your email address</DialogTitle>
              <DialogDescription>
                {step === 'email'
                  ? "You'll use the new address to sign in. We'll send it a code to check it's yours."
                  : `We sent a 6-digit code to ${newEmail}. It expires in 10 minutes.`}
              </DialogDescription>
            </DialogHeader>

            {step === 'email' ? (
              <form onSubmit={requestCode} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-email">New email address</Label>
                  <Input
                    id="new-email"
                    type="email"
                    autoComplete="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value)
                      setError('')
                    }}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={isSubmitting || !newEmail}>
                  {isSubmitting ? 'Sending...' : 'Send code'}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  confirm(otp)
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={onOtpChange}
                    disabled={isSubmitting}
                    autoFocus
                    pattern={REGEXP_ONLY_DIGITS}
                    aria-label="Verification code"
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
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  disabled={isSubmitting || otp.length !== 6}
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm'}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setStep('email')
                    setOtp('')
                    setError('')
                  }}
                >
                  Use a different address
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
