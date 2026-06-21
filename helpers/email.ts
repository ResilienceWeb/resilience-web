import { render } from 'react-email'
import { createTransport } from 'nodemailer'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const sentFrom = 'Resilience Web <noreply@resilienceweb.org.uk>'

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
    })

    return
  }

  await resend.emails.send({
    from: sentFrom,
    to,
    replyTo: replyTo ?? process.env.EMAIL_FROM,
    subject,
    html: emailHtml,
    text: emailText,
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
