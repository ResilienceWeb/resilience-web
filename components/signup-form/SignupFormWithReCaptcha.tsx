'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { useInView } from 'react-intersection-observer'
import { ReCaptchaProvider } from 'next-recaptcha-v3'
import type { SignupFormProps } from './SignupForm'
import SignupFormPlaceholder from './SignupFormPlaceholder'

/**
 * Defers both halves of the signup form until it is about to scroll into view,
 * with an interaction fallback.
 *
 * The form is validated with Zod through react-hook-form, which is ~42 KiB
 * gzipped, and it sits in the footer of every public page — so importing it
 * statically put all of that in the initial bundle for a newsletter box almost
 * nobody scrolls to. The Google reCAPTCHA script (~374 KiB) it needs in order
 * to submit is deferred on the same trigger.
 *
 * The stand-in below keeps taking input for as long as the real form is still
 * arriving, and hands over what was typed. It deliberately does not swap while
 * it has focus: replacing the element mid-word drops the keystrokes in flight.
 */

let pendingModule: Promise<{ default: ComponentType<SignupFormProps> }> | null =
  null

const loadSignupForm = () => (pendingModule ??= import('./SignupForm'))

const SignupFormWithReCaptcha = () => {
  const [Form, setForm] = useState<ComponentType<SignupFormProps> | null>(null)
  const [email, setEmail] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  // Only steal focus back if the visitor was already typing into the stand-in.
  const [wasFocused, setWasFocused] = useState(false)

  const load = useCallback(() => {
    loadSignupForm()
      .then((module) => {
        setForm(() => module.default)
        return module
      })
      .catch(() => {
        // Leave the stand-in in place; a reload is the recovery.
      })
  }, [])

  const { ref, inView } = useInView({
    triggerOnce: true,
    // Start loading ~300px before the form enters the viewport so it is ready
    // by the time the visitor reaches it.
    rootMargin: '300px 0px',
  })

  useEffect(() => {
    if (inView) load()
  }, [inView, load])

  if (!Form || isFocused) {
    return (
      <SignupFormPlaceholder
        formRef={ref}
        value={email}
        onValueChange={setEmail}
        onFocus={() => {
          setIsFocused(true)
          setWasFocused(true)
          load()
        }}
        onBlur={() => setIsFocused(false)}
        // Submitting means they have finished typing, so it is safe to swap
        // even though focus is still inside.
        onSubmit={() => setIsFocused(false)}
      />
    )
  }

  return (
    <ReCaptchaProvider>
      <Form formRef={ref} defaultEmail={email} takeFocus={wasFocused} />
    </ReCaptchaProvider>
  )
}

export default SignupFormWithReCaptcha
