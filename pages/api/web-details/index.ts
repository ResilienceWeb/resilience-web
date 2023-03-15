import type { Location } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const webDetails: Location[] | null = await prisma.location.findMany()
    res.status(200).json({ webDetails })
  } catch (e) {
    res.status(500).json({
      error: `Unable to fetch webDetails from database - ${e}`,
    })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler

