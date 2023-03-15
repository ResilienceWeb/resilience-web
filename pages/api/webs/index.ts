import type { Location } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../prisma/client'
import type { Result } from '../type.d'

interface Data {
  webs: null | Location[]
}

const handler = async (
  _req: NextApiRequest,
  res: NextApiResponse<Result<Data>>,
) => {
  try {
    const webs: Data['webs'] = await prisma.location.findMany()
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
