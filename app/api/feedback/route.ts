import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { sendEmail } from '@helpers/email'

export async function POST(request: NextRequest) {
  const { email, feedback } = await request.json()

  try {
    await sendEmail({
      email: feedback,
      subject: `Message from ${email}`,
      to: 'cambridgeresilienceweb@gmail.com',
      replyTo: email,
    })

    return Response.json(
      {
        result: 'Feedback sent successfully',
      },
      { status: 201 },
    )
  } catch (e) {
    Sentry.captureException(e)
    return new Response(`Unable to send feedback - ${e}`, {
      status: 500,
    })
  }
}
