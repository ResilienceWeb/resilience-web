import { render } from '@react-email/render'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmail = async ({ to, subject, email }) => {
  const emailHtml = await render(email)
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
