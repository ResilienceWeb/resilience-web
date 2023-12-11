import { render } from '@react-email/render'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmail = async ({ to, subject, email }) => {
  const webCreatedEmailHtml = render(email)
  const webCreatedEmailText = render(email, {
    plainText: true,
  })

  await sgMail.send({
    from: `Resilience Web <info@resilienceweb.org.uk>`,
    to,
    subject,
    text: webCreatedEmailText,
    html: webCreatedEmailHtml,
  })
}
