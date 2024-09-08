import nodemailer, { type TransportOptions } from 'nodemailer'
import appConfig from '@helpers/config'

export async function POST(request) {
  const { email, feedback } = await request.json()

  try {
    const transporter = nodemailer.createTransport(
      appConfig.emailServer as TransportOptions,
    )
    transporter.sendMail(
      {
        to: 'cambridgeresilienceweb@gmail.com',
        from: `${process.env.EMAIL_FROM}`,
        replyTo: email,
        subject: `Message from ${email}`,
        text: `${feedback}`,
      },
      (error) => {
        if (error) {
          console.error('[RW] Error sending feedback email', email, error)
        }
      },
    )

    return Response.json(
      {
        result: 'Feedback sent successfully',
      },
      { status: 201 },
    )
  } catch (e) {
    return new Response(`Unable to send feedback - ${e}`, {
      status: 500,
    })
  }
}
