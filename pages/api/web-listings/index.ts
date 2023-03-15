import type { Location, Listing } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'
import type { Result } from '../type.d'

export interface WebListing extends Location {
  listings: {
    id: Listing['id']
    locationId: Listing['locationId']
  }[]
}

interface Data {
  webListings: null | WebListing[]
}

const handler = async (
  _req: NextApiRequest,
  res: NextApiResponse<Result<Data>>,
) => {
  try {
    const webListings: WebListing[] | null = await prisma.location.findMany({
      include: {
        listings: {
          select: {
            id: true,
            locationId: true,
          },
        },
      },
    })
    res.status(200).json({ webListings })
  } catch (e) {
    res.status(500).json({
      error: `Unable to fetch webListings from database - ${e}`,
    })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler

