import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'

function exclude(user, keys) {
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => !keys.includes(key)),
  )
}

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
              web: {
                slug: {
                  contains: webSlug,
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
        tags: {
          select: {
            id: true,
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
    })

    const listingWithoutRedundantFields = exclude(listing, [
      'createdAt',
      'updatedAt',
      'notes',
      'inactive',
    ])

    res.status(200)
    res.json({ listing: listingWithoutRedundantFields })
  } catch (e) {
    res.status(500)
    res.json({ error: `Unable to fetch listing by slug - ${e}` })
    console.error(`[RW] Unable to fetch listing by slug - ${e}`)
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
