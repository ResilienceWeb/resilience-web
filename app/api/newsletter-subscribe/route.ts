import type { NextRequest } from 'next/server'
import { callerIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'
import { verifyRecaptcha } from '@/lib/verify-recaptcha'
import * as Sentry from '@sentry/nextjs'
import { subscribe } from '@helpers/mailingList'

export async function POST(request: NextRequest) {
  const { email, recaptchaToken } = await request.json()

  if (!email || !email.length) {
    return Response.json(
      { error: 'Please enter your email address.' },
      { status: 400 },
    )
  }

  const limit = await rateLimit('newsletter', callerIp(request), 5, 60 * 60)
  if (!limit.ok) {
    return tooManyRequests(limit, 'Too many attempts. Please try again later.')
  }

  if (!(await verifyRecaptcha(recaptchaToken))) {
    return Response.json(
      {
        error:
          "We couldn't verify this request automatically. If you're not a bot, please get in touch using the 'Get in touch' button at the top of the page and we'll add you to the mailing list manually.",
      },
      { status: 403 },
    )
  }

  try {
    await subscribe(email)
    return Response.json({ error: null }, { status: 201 })
  } catch (error) {
    console.error(`[RW] Failed to sign up user to newsletter - ${error}`)
    Sentry.captureException(error)
    return Response.json(
      {
        error:
          "Something went wrong on our end and we couldn't add you to the list. Please email info@resilienceweb.org.uk and we'll sort it out for you.",
      },
      { status: 502 },
    )
  }
}
