import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { withSentry } from '@sentry/nextjs'
import prisma from '../../../prisma/client'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession({ req })
    if (!session?.user.admin) {
      res.status(403)
      res.json({
        error: `You don't have enough permissions to access this data.`,
      })
    }

    const { email } = req.query

    const user = await prisma.user.findUnique({
      where: { email },
    })
    res.status(200)
    res.json({ user })
  } catch (e) {
    res.status(500)
    res.json({
      error: `Unable to get user from database - ${e}`,
    })
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
}

export default withSentry(handler)
