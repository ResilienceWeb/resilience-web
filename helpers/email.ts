import { render } from '@react-email/render'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmail = async ({ to, subject, email }) => {
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const emailHtml = await render(email)
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const emailText = await render(email, {
    plainText: true,
  })

  await sgMail.send({
    from: `Resilience Web <info@resilienceweb.org.uk>`,
    to,
    subject,
    html: emailHtml,
    text: emailText,
  })
}
