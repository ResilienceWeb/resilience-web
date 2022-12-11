import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const webs = await prisma.location.findMany({
      include: {
        listings: {
          select: {
            id: true,
            locationId: true,
          },
        },
      },
    })
    res.status(200).json({ webs })
  } catch (e) {
    res.status(500).json({
      error: `Unable to fetch webs from database - ${e}`,
    })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
