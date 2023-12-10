import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '../../../prisma/client'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    const { email } = req.query
    if (!session?.user.admin && session?.user.email !== email) {
      res.status(403)
      res.json({
        error: `You don't have enough permissions to access this data.`,
      })
    }

    switch (req.method) {
      case 'GET':
        const user = await prisma.user.findUnique({
          where: { email },
          include: { ownerships: true },
        })
        res.status(200)
        res.json({ user })
        break
      case 'PUT':
        const updatedUser = await prisma.user.update({
          where: { email },
          data: req.body,
        })

        res.status(200)
        res.json({ data: updatedUser })
        break
      default:
        res.status(500)
        res.json({
          error: `Method ${req.method} not supported at this endpoint`,
        })
        break
    }
  } catch (e) {
    res.status(500)
    res.json({ error: `Unable to fetch user - ${e}` })
    console.error(`[RW] Unable to fetch user - ${e}`)
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default handler
