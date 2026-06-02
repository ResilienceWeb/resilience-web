import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

export async function POST(request: NextRequest) {
  const { email, recaptchaToken } = await request.json()

  if (!email || !email.length) {
    return Response.json(
      { error: 'Please enter your email address.' },
      { status: 400 },
    )
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
  const recaptchaRes = await fetch(verifyUrl, { method: 'POST' })
  const recaptchaInfo = await recaptchaRes.json()

  if (recaptchaInfo.score < 0.5) {
    return Response.json(
      {
        error:
          "We couldn't verify this request automatically. If you're not a bot, please get in touch using the 'Get in touch' button at the top of the page and we'll add you to the mailing list manually.",
      },
      { status: 403 },
    )
  }

  try {
    const response = await fetch(
      'https://connect.mailerlite.com/api/subscribers',
      {
        method: 'POST',
        body: JSON.stringify({
          email,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MAILERLITE_API_KEY}`,
        },
      },
    )
    const data = await response.json()

    if (data.error) {
      return Response.json({ error: data.error }, { status: 400 })
    }

    return Response.json({ error: null }, { status: 201 })
  } catch (error) {
    console.error(`[RW] Failed to sign up user to newsletter - ${error}`)
    Sentry.captureException(error)
    return Response.json(
      {
        error:
          "Something went wrong on our end and we couldn't add you to the list. Please email info@resilienceweb.org.uk and we'll sort it out for you.",
      },
      { status: 400 },
    )
  }
}
