'use client'

import { useState } from 'react'
import { ReCaptchaProvider } from 'next-recaptcha-v3'
import SignupForm from './SignupForm'

/**
 * Defers loading the (~374 KiB) Google reCAPTCHA script until the user first
 * interacts with the signup form. Previously the ReCaptchaProvider wrapped the
 * whole app, so the script was fetched on every page load even though it's only
 * needed when submitting the form.
 */
const SignupFormWithReCaptcha = () => {
  const [shouldLoadReCaptcha, setShouldLoadReCaptcha] = useState(false)

  const form = <SignupForm onInteract={() => setShouldLoadReCaptcha(true)} />

  if (!shouldLoadReCaptcha) {
    return form
  }

  return <ReCaptchaProvider>{form}</ReCaptchaProvider>
}

export default SignupFormWithReCaptcha
