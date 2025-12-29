import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

export async function POST(request: NextRequest) {
  const { email, recaptchaToken } = await request.json()

  if (!email || !email.length) {
    return Response.json({ error: 'Forgot to add your email' }, { status: 400 })
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
  const recaptchaRes = await fetch(verifyUrl, { method: 'POST' })
  const recaptchaInfo = await recaptchaRes.json()

  if (recaptchaInfo.score < 0.5) {
    return Response.json(
      {
        error:
          "Our automated checks think you're a bot 😬. If that's not right, please get in touch via the Get in Touch button at the top of the website and we can add you to the mailing list manually. Sorry!",
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
          'Oops, something went wrong. Please send an email to info@resilienceweb.org.uk and we can add you to the list.',
      },
      { status: 400 },
    )
  }
}
