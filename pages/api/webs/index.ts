import type { Web } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '../../../prisma/client'
import type { Result } from '../type.d'
import { stringToBoolean } from '@helpers/utils'

interface Data {
  error?: string
  data: null | Web[] | Web
  webs: Web[] // temporary to not break build
}

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

      try {
        const webs = await prisma.web.findMany({
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
        break
      } catch (e) {
        res.status(500).json({ error: `Unable to fetch webs - ${e}` })
        console.error(`[RW] Unable to fetch webs - ${e}`)
      }
    }
    case 'POST': {
      const session = await getServerSession(req, res, authOptions)
      if (!session?.user) {
        res.status(403)
        res.json({
          error: 'You are not allowed to perform this action',
        })
      }

      const web = await prisma.web.create({
        data: {
          title: 'Cambridge',
          slug: 'cambridge',
          published: false,
        },
      })

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
