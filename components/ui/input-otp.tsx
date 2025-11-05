'use client'

import * as React from 'react'
import { OTPInput, OTPInputContext } from 'input-otp'
import { Minus } from 'lucide-react'
import { cn } from '@components/lib/utils'

const InputOTP = ({
  className,
  containerClassName,
  ...props
}: React.ComponentPropsWithoutRef<typeof OTPInput>) => (
  <OTPInput
    containerClassName={cn(
      'flex items-center gap-3 has-[:disabled]:opacity-50',
      containerClassName,
    )}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
)

const InputOTPGroup = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex items-center', className)} {...props} />
)

const InputOTPSlot = ({
  index,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { index: number }) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      className={cn(
        'relative flex h-17 w-17 items-center justify-center border-y border-r border-input text-2xl shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
        isActive && 'z-10 ring-1 ring-ring',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}

const InputOTPSeparator = ({
  ...props
}: React.ComponentPropsWithoutRef<'div'>) => (
  <div role="separator" {...props}>
    <Minus />
  </div>
)

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
