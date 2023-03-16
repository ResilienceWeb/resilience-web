import type { Location } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'
import type { Result } from '../type.d'
import { stringToBoolean } from '@helpers/utils'

interface Data {
  webs: null | Location[]
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Result<Data>>,
) => {
  const withListings = req.query.withListings ? stringToBoolean(req.query.withListings as string) : false

  try {
    const webs: Data['webs'] = await prisma.location.findMany({
      include: withListings ? {
        listings: {
          select: {
            id: true,
            locationId: true,
          },
        },
      } : null,
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
