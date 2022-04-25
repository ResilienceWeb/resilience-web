import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { withSentry } from '@sentry/nextjs'
import prisma from '../../../prisma/client'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getSession({ req })

        if (!session?.user) {
            res.status(403)
            res.json({
                error: `You don't have enough permissions to access this data.`,
            })
        }

        let email = session?.user.email
        if (req.query?.email) {
            email = req.query.email as string
        }

        const editPermissions = await prisma.editPermission.findMany({
            include: {
                listing: true,
            },
            where: { email: email },
        })

        res.status(200)
        if (req.query?.email) {
            res.json({ editPermissions })
        } else {
            const editPermissionsArray = editPermissions.map(
                (ep) => ep.listing.id,
            )
            res.json({ editPermissions: editPermissionsArray })
        }
    } catch (e) {
        res.status(500)
        res.json({
            error: `Unable to fetch edit permissions from database - ${e}`,
        })
    }
}

export const config = {
    api: {
        externalResolver: true,
    },
}

export default withSentry(handler)
