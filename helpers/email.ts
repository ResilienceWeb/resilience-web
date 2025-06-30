import { render } from '@react-email/render'
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
})

const sentFrom = new Sender('info@resilienceweb.org.uk', 'Resilience Web')

export const sendEmail = async ({ to, subject, email }) => {
  const emailHtml = await render(email)
  const emailText = await render(email, {
    plainText: true,
  })

  const recipients = [new Recipient(to)]

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(subject)
    .setHtml(emailHtml)
    .setText(emailText)

  await mailerSend.email.send(emailParams)
}
