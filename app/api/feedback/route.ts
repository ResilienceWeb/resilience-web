import type { NextRequest } from 'next/server'
import { after } from 'next/server'
import { log, flushLogs } from '@/lib/logger'
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

    log('info', 'Feedback submitted successfully', {
      endpoint: '/api/feedback',
    })

    after(async () => {
      await flushLogs()
    })

    return Response.json(
      {
        result: 'Feedback sent successfully',
      },
      { status: 201 },
    )
  } catch (e) {
    Sentry.captureException(e)
    log('error', 'Failed to send feedback', {
      endpoint: '/api/feedback',
      error: String(e),
    })

    after(async () => {
      await flushLogs()
    })

    return new Response(`Unable to send feedback - ${e}`, {
      status: 500,
    })
  }
}
