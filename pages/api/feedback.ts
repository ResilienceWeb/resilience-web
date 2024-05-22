import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import appConfig from '@helpers/config'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { email, feedback } = req.body

    if (req.method === 'POST') {
      const transporter = await nodemailer.createTransport(
        appConfig.emailServer,
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

      res.status(201)
      res.json({
        result: 'Feedback sent successfully',
      })
    }
  } catch (e) {
    res.status(500)
    res.json({
      error: `Unable to send feedback - ${e}`,
    })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
