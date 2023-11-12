import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '../../../prisma/client'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      res.status(403)
      res.json({
        error: `You don't have enough permissions to access this data.`,
      })
    }

    const { webSlug } = req.query

    const permissions = await prisma.permission.findMany({
      where: {
        webs: {
          some: {
            slug: {
              equals: webSlug,
            },
          },
        },
      },
      include: {
        webs: true,
        user: true,
      },
    })

    res.status(200)
    res.json({ permissions })
  } catch (e) {
    res.status(500)
    res.json({ error: `Unable to fetch permissions - ${e}` })
    console.error(`[RW] Unable to fetch permissions - ${e}`)
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
