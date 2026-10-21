import { render } from 'react-email'
import { createTransport } from 'nodemailer'
import { getResend } from './resend'

const sentFrom = 'Resilience Web <noreply@resilienceweb.org.uk>'

// Ask receiving servers not to send out-of-office and vacation replies.
// Auto-Submitted is RFC 3834; X-Auto-Response-Suppress is Exchange's equivalent.
const AUTOMATED_MAIL_HEADERS = {
  'Auto-Submitted': 'auto-generated',
  'X-Auto-Response-Suppress': 'All',
}

export const sendEmail = async ({
  to,
  subject,
  email,
  replyTo,
}: {
  to: string
  subject: string
  email: any
  replyTo?: string
}) => {
  const emailHtml = await render(email)
  const emailText = await render(email, {
    plainText: true,
  })

  if (process.env.NODE_ENV === 'development') {
    const transport = createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    await transport.sendMail({
      to,
      from: process.env.EMAIL_FROM,
      replyTo: replyTo ?? process.env.EMAIL_FROM,
      subject,
      text: emailText,
      html: emailHtml,
      headers: AUTOMATED_MAIL_HEADERS,
    })

    return
  }

  await getResend().emails.send({
    from: sentFrom,
    to,
    replyTo: replyTo ?? process.env.EMAIL_FROM,
    subject,
    html: emailHtml,
    text: emailText,
    headers: AUTOMATED_MAIL_HEADERS,
  })
}

export const sendMultipleEmails = async ({ toEmails, subject, email }) => {
  const emailPromises = toEmails.map(async (emailAddress) => {
    await sendEmail({
      to: emailAddress,
      subject,
      email,
    })
  })

  await Promise.all(emailPromises)
}
