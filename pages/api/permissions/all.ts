import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '../../../prisma/client'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user.admin) {
      res.status(403)
      res.json({
        error: `You don't have enough permissions to access this data.`,
      })
    }

    const permissions = await prisma.permission.findMany({
      where: {
        user: {
          admin: false,
        },
      },
      include: {
        listings: true,
        locations: true,
        user: true,
      },
    })
    res.status(200)
    res.json({ permissions })
  } catch (e) {
    res.status(500)
    res.json({
      error: `Unable to fetch permissions from database - ${e}`,
    })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
