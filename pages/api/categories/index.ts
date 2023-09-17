import { Category } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'

type ResponseData = {
  error?: string
  data?: Category | Category[]
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) => {
  try {
    const { web } = req.query

    switch (req.method) {
      case 'GET': {
        const categories: Category[] = await prisma.category.findMany({
          where: {
            web: {
              slug: {
                contains: web || 'cambridge-city',
              },
            },
          },
          include: {
            listings: true,
          },
          orderBy: [
            {
              id: 'asc',
            },
          ],
        })
        res.status(200)
        res.json({ data: categories })

        break
      }
      case 'POST': {
        const category = await prisma.category.create({
          data: req.body,
        })
        res.status(201)
        res.json({ data: category })

        break
      }
      case 'PATCH': {
        const category = await prisma.category.update({
          where: {
            id: req.body.id,
          },
          data: req.body,
        })

        res.status(200)
        res.json({ data: category })

        break
      }
      default: {
        res.status(500)
        res.json({
          error: `Method ${req.method} not supported at this endpoint`,
        })
        break
      }
    }
  } catch (e) {
    res.status(500)
    res.json({ error: `Unable to ${req.method} category - ${e}` })
    console.error(`[RW] Unable to ${req.method} category - ${e}`)
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
