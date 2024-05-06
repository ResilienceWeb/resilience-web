import { User } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import client from '@sendgrid/client'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '../../../prisma/client'

client.setApiKey(process.env.SENDGRID_API_KEY)

type ResponseData = {
  error?: string
  data?: User
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user) {
    res.status(403)
    res.json({
      error: `You don't have permission to perform this action.`,
    })
  }

  switch (req.method) {
    case 'PATCH':
      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          name: req.body.name,
        },
      })

      if (req.body.subscribed) {
        const request = {
          url: `/v3/marketing/contacts`,
          method: 'PUT',
          body: {
            contacts: [
              {
                email: session.user.email,
              },
            ],
          },
        }
        // @ts-ignore
        await client.request(request)
      } else {
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
          const contactId = // @ts-ignore
            response[0].body.result[session?.user.email].contact.id

          const deleteRequest = {
            url: `/v3/marketing/contacts`,
            method: 'DELETE',
            qs: {
              ids: `${contactId}`,
            },
          }
          // @ts-ignore
          await client.request(deleteRequest)
        } catch (e) {
          // User is not currently subscribed. It shouldn't be an error, but for some reason the Sendgrid API throws an error.
        }
      }

      res.status(200)
      res.json({ data: updatedUser })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
