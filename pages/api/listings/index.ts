import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { web } = req.query
  try {
    const listings = await prisma.listing.findMany({
      where: {
        ...(web
          ? {
              location: {
                slug: {
                  contains: web,
                },
              },
            }
          : {}),
      },
      include: {
        category: true,
        location: true,
        tags: true,
        relations: {
          include: {
            category: true,
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
    res.json({
      error: `Unable to fetch listings from database - ${e}`,
    })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
