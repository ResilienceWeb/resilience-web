import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { web } = req.query
  try {
    const listings = await prisma.listing.findMany({
      where: {
        ...(web
          ? {
              web: {
                slug: {
                  contains: web,
                },
              },
            }
          : {}),
      },
      include: {
        category: {
          select: {
            id: true,
            color: true,
            label: true,
          },
        },
        web: true,
        tags: {
          select: {
            label: true,
          },
        },
        relations: {
          include: {
            category: {
              select: {
                id: true,
                color: true,
                label: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    })
    res.status(200)
    res.json({ listings })
  } catch (e) {
    res.status(500)
    res.json({ error: `Unable to fetch listings - ${e}` })
    console.error(`[RW] Unable to fetch listings - ${e}`)
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
