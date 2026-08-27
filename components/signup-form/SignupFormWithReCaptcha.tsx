'use client'

import { useInView } from 'react-intersection-observer'
import { ReCaptchaProvider } from 'next-recaptcha-v3'
import SignupForm from './SignupForm'

/**
 * Defers loading the (~374 KiB) Google reCAPTCHA script until the signup form is
 * about to scroll into view (a rootMargin gives it a head start so it's ready
 * before the user can interact). Previously the ReCaptchaProvider wrapped the
 * whole app, so the script was fetched on every page load even though it's only
 * needed when submitting the form.
 *
 * Mounting the provider re-parents the form, which remounts it and throws away
 * anything it holds — so the only thing allowed to trigger it is the observer,
 * which fires before the form is on screen and therefore before anyone can have
 * typed into it. It used to also trigger on focus, and react-hook-form focuses
 * the field it just rejected: submitting an empty form set an error, the focus
 * that followed remounted the form, and the error vanished before it could be
 * read.
 */
const SignupFormWithReCaptcha = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    // Start loading ~300px before the form enters the viewport so the script is
    // ready by the time the user reaches and clicks it.
    rootMargin: '300px 0px',
  })

  const form = <SignupForm formRef={ref} />

  if (!inView) {
    return form
  }

  return <ReCaptchaProvider>{form}</ReCaptchaProvider>
}

export default SignupFormWithReCaptcha
