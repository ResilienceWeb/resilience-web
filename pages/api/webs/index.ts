import type { Web } from '@prisma/client'
import { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '../../../prisma/client'
import type { Result } from '../type.d'
import { stringToBoolean } from '@helpers/utils'
import WebCreatedEmail from '@components/emails/WebCreatedEmail'
import WebCreatedAdminEmail from '@components/emails/WebCreatedAdminEmail'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { sendEmail } from '@helpers/email'

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

      const withAdminInfo = req.query.withAdminInfo
        ? stringToBoolean(req.query.withAdminInfo as string)
        : false

      const onlyPublished = req.query.published
        ? stringToBoolean(req.query.published as string)
        : false

      const include = Prisma.validator<Prisma.WebInclude>()({
        listings: {},
        permissions: {},
        ownerships: {},
      })

      if (withListings) {
        include.listings = {
          select: {
            id: true,
            webId: true,
          },
        }
      }

      if (withAdminInfo) {
        include.permissions = true
        include.ownerships = true
      }

      try {
        const webs = await prisma.web.findMany({
          where: {
            ...(onlyPublished
              ? {
                  published: true,
                }
              : {}),
          },
          include,
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

      try {
        const web = await prisma.web.create({
          data: {
            title,
            slug,
            published: false,
            categories: {
              create: defaultCategories,
            },
            ownerships: {
              connectOrCreate: {
                where: {
                  email: session.user.email,
                },
                create: {
                  email: session.user.email,
                },
              },
            },
          },
        })

        const webCreatedEmailComponent = WebCreatedEmail({
          webTitle: `${web.title}`,
          url: `${PROTOCOL}://${REMOTE_HOSTNAME}/admin`,
        })

        const webCreatedAdminEmailComponent = WebCreatedAdminEmail({
          webTitle: `${web.title}`,
          email: `${session?.user.email}`,
        })

        await sendEmail({
          to: session?.user.email,
          subject: `Thank you for creating ${web.title} Resilience Web 🎉`,
          email: webCreatedEmailComponent,
        })

        await sendEmail({
          to: REMOTE_HOSTNAME.includes('localhost')
            ? 'ismail.diner+rw@gmail.com'
            : 'info@resilienceweb.org.uk',
          subject: `Someone just created a new resilience web 🎉`,
          email: webCreatedAdminEmailComponent,
        })

        res.status(201).json({ data: web, webs: null })
      } catch (error) {
        if (error.code === 'P2002') {
          res.status(409).json({
            error: 'Sorry, a web with the same title or link already exists',
          })
        }
      }

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
