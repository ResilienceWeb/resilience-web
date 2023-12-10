/* eslint-disable sonarjs/cognitive-complexity */
import type { Web } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { render } from '@react-email/render'
import sgMail from '@sendgrid/mail'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '../../../prisma/client'
import type { Result } from '../type.d'
import { stringToBoolean } from '@helpers/utils'
import WebCreatedEmail from '@components/emails/WebCreatedEmail'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

interface Data {
  error?: string
  webs: null | Web[]
  data: null | Web | Web[]
}

const defaultCategories = [
  {
    label: 'Environment',
    color: '7ed957',
  },
  {
    label: 'Community',
    color: 'ff66c4',
  },
  {
    label: 'Social justice',
    color: 'ff5757',
  },
]

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Result<Data>>,
) => {
  switch (req.method) {
    case 'GET': {
      const withListings = req.query.withListings
        ? stringToBoolean(req.query.withListings as string)
        : false

      const onlyPublished = req.query.published
        ? stringToBoolean(req.query.published as string)
        : false

      try {
        const webs: Data['webs'] = await prisma.web.findMany({
          where: {
            ...(onlyPublished
              ? {
                  published: true,
                }
              : {}),
          },
          include: withListings
            ? {
                listings: {
                  select: {
                    id: true,
                    webId: true,
                  },
                },
              }
            : null,
        })

        res.status(200).json({ data: webs, webs })
      } catch (e) {
        res.status(500).json({ error: `Unable to fetch webs - ${e}` })
        console.error(`[RW] Unable to fetch webs - ${e}`)
      }
      break
    }
    case 'POST': {
      const session = await getServerSession(req, res, authOptions)
      if (!session?.user) {
        res.status(403)
        res.json({
          error: 'You are not allowed to perform this action',
        })
      }

      const { title, slug } = req.body

      const web = await prisma.web.create({
        data: {
          title,
          slug,
          published: false,
        },
      })

      for (const category of defaultCategories) {
        await prisma.category.create({
          data: {
            ...category,
            webId: web.id,
          },
        })
      }

      await prisma.ownership.upsert({
        where: {
          email: session.user.email,
        },
        create: {
          email: session.user.email,
          webs: {
            connect: [{ id: web.id }],
          },
        },
        update: {
          email: session.user.email,
          webs: {
            connect: [{ id: web.id }],
          },
        },
      })

      const webCreatedEmailComponent = WebCreatedEmail({
        webTitle: `${web.title}`,
        url: `${PROTOCOL}://${REMOTE_HOSTNAME}/admin`,
      })
      const webCreatedEmailHtml = render(webCreatedEmailComponent)
      const webCreatedEmailText = render(webCreatedEmailComponent, {
        plainText: true,
      })

      try {
        const msg = {
          from: `Resilience Web <info@resilienceweb.org.uk>`,
          to: session?.user.email,
          subject: `Thank you for creating ${web.title} Resilience Web 🎉`,
          text: webCreatedEmailText,
          html: webCreatedEmailHtml,
        }

        await sgMail.send(msg)
      } catch (error) {
        console.error(error)

        if (error.response) {
          console.error(error.response.body)
        }
      }

      res.status(201)
      res.json({ data: web, webs: null })

      break
    }
    default: {
      res.status(400)
      res.json({
        error: `Method ${req.method} not supported at this endpoint`,
      })
      break
    }
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
