import type { NextRequest } from 'next/server'
import { after } from 'next/server'
import { log, flushLogs } from '@/lib/logger'
import * as Sentry from '@sentry/nextjs'
import { sendEmail } from '@helpers/email'
import ContactEmail from '@components/emails/ContactEmail'

export async function POST(request: NextRequest) {
  const { email, web, message } = await request.json()

  try {
    await sendEmail({
      email: ContactEmail({ email, web, message }),
      subject: `Message from ${email}${web ? ` (${web})` : ''}`,
      to: 'cambridgeresilienceweb@gmail.com',
      replyTo: email,
    })

    log('info', 'Contact message submitted successfully', {
      endpoint: '/api/contact',
    })

    after(async () => {
      await flushLogs()
    })

    return Response.json(
      {
        result: 'Message sent successfully',
      },
      { status: 201 },
    )
  } catch (e) {
    Sentry.captureException(e)
    log('error', 'Failed to send contact message', {
      endpoint: '/api/contact',
      error: String(e),
    })

    after(async () => {
      await flushLogs()
    })

    return new Response(`Unable to send message - ${e}`, {
      status: 500,
    })
  }
}
