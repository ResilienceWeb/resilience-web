import type { NextApiRequest, NextApiResponse } from 'next'
import { Location } from '@prisma/client'
import prisma from '../../../prisma/client'

type ResponseData = {
  error?: string
  web?: Location
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) => {
  try {
    const { slug } = req.query
    const web = await prisma.location.findFirst({
      where: {
        slug,
      },
    })
    res.status(200).send({ web })
  } catch (e) {
    res.status(500).send({
      error: `Unable to fetch web from database - ${e}`,
    })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
