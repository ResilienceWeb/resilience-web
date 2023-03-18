import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      res.status(500)
      res.json({
        error: `Method ${req.method} not supported at this endpoint`,
      })
    }

    const { slug, web: webSlug } = req.query
    const listing = await prisma.listing.findFirst({
      where: {
        slug,
        ...(webSlug
          ? {
              location: {
                slug: {
                  contains: webSlug,
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
        relationOf: true,
      },
    })

    res.status(200)
    res.json({ listing })
  } catch (e) {
    res.status(500)
    res.json({
      error: `Unable to fetch listing by slug - ${e}`,
    })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
