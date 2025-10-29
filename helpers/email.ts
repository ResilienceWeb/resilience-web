import { render } from '@react-email/render'
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'
import { createTransport } from 'nodemailer'

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
})

const sentFrom = new Sender('info@resilienceweb.org.uk', 'Resilience Web')

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

  const recipients = [new Recipient(to)]
  const replyToSender = new Sender(replyTo ?? process.env.EMAIL_FROM)

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(replyToSender)
    .setSubject(subject)
    .setHtml(emailHtml)
    .setText(emailText)

  await mailerSend.email.send(emailParams)
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
