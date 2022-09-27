import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const sites = await prisma.location.findMany()
    res.status(200).json({ sites })
  } catch (e) {
    res.status(500).json({
      error: `Unable to fetch sites from database - ${e}`,
    })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
