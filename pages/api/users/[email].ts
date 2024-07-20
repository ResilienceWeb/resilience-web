import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import client from '@sendgrid/client'
import { authOptions } from '../../../app/auth'
import prisma from '../../../prisma/client'

client.setApiKey(process.env.SENDGRID_API_KEY)

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    const { email } = req.query
    if (!session?.user.admin && session?.user.email !== email) {
      res.status(403)
      res.json({
        error: `You don't have enough permissions to access this data.`,
      })
    }

    switch (req.method) {
      case 'GET':
        let subscribedToMailingList = false
        try {
          const request = {
            url: `/v3/marketing/contacts/search/emails`,
            method: 'POST',
            body: {
              emails: [session?.user.email],
            },
          }
          // @ts-ignore
          const response = await client.request(request)
          if (response[0].statusCode === 200) {
            subscribedToMailingList = true
          }
        } catch (e) {
          // User is not currently subscribed. It shouldn't be an error, but for some reason the Sendgrid API throws an error.
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { ownerships: true },
        })
        res.status(200)
        res.json({ data: { ...user, subscribed: subscribedToMailingList } })
        break
      case 'PUT':
        const updatedUser = await prisma.user.update({
          where: { email },
          data: req.body,
        })

        res.status(200)
        res.json({ data: updatedUser })
        break
      default:
        res.status(500)
        res.json({
          error: `Method ${req.method} not supported at this endpoint`,
        })
        break
    }
  } catch (e) {
    res.status(500)
    res.json({ error: `Unable to fetch user - ${e}` })
    console.error(`[RW] Unable to fetch user - ${e}`)
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
