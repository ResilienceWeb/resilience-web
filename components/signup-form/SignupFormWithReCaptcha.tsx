'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { ReCaptchaProvider } from 'next-recaptcha-v3'
import SignupForm from './SignupForm'

/**
 * Defers loading the (~374 KiB) Google reCAPTCHA script until the signup form is
 * about to scroll into view (a rootMargin gives it a head start so it's ready
 * before the user can interact), with a focus fallback. Previously the
 * ReCaptchaProvider wrapped the whole app, so the script was fetched on every
 * page load even though it's only needed when submitting the form.
 */
const SignupFormWithReCaptcha = () => {
  const [shouldLoadReCaptcha, setShouldLoadReCaptcha] = useState(false)
  const { ref, inView } = useInView({
    triggerOnce: true,
    // Start loading ~300px before the form enters the viewport so the script is
    // ready by the time the user reaches and clicks it.
    rootMargin: '300px 0px',
  })

  useEffect(() => {
    if (inView) {
      setShouldLoadReCaptcha(true)
    }
  }, [inView])

  const form = (
    <SignupForm
      formRef={ref}
      onInteract={() => setShouldLoadReCaptcha(true)}
    />
  )

  if (!shouldLoadReCaptcha) {
    return form
  }

  return <ReCaptchaProvider>{form}</ReCaptchaProvider>
}

export default SignupFormWithReCaptcha
