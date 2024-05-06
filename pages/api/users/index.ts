import { User } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '../../../prisma/client'

type ResponseData = {
  error?: string
  data?: User
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) => {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user) {
    res.status(403)
    res.json({
      error: `You don't have permission to perform this action.`,
    })
  }

  switch (req.method) {
    case 'PATCH':
      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          name: req.body.name,
        },
      })

      res.status(200)
      res.json({ data: updatedUser })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
