import type { NextRequest } from 'next/server'
import { after } from 'next/server'
import { log, flushLogs } from '@/lib/logger'
import { callerIp, rateLimit, tooManyRequests } from '@/lib/rate-limit'
import { verifyRecaptcha } from '@/lib/verify-recaptcha'
import * as Sentry from '@sentry/nextjs'
import { sendEmail } from '@helpers/email'
import ContactEmail from '@components/emails/ContactEmail'

export async function POST(request: NextRequest) {
  const { email, web, message, recaptchaToken } = await request.json()

  // This endpoint sends mail to a fixed inbox, so an unbounded one is a spam
  // relay with the project's sending reputation attached.
  const limit = await rateLimit('contact', callerIp(request), 3, 60 * 60)
  if (!limit.ok) {
    return tooManyRequests(
      limit,
      'You have sent several messages already. Please try again later.',
    )
  }

  if (!(await verifyRecaptcha(recaptchaToken))) {
    return Response.json(
      {
        error:
          "We couldn't verify this request automatically. Please email info@resilienceweb.org.uk and we'll pick it up from there.",
      },
      { status: 403 },
    )
  }

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
