import type { NextApiRequest, NextApiResponse } from 'next'
import { withSentry } from '@sentry/nextjs'
import { Location } from '@prisma/client'
import prisma from '../../../prisma/client'

type ResponseData = {
    error?: string
    site?: Location
}

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>,
) => {
    try {
        const { slug } = req.query
        const site = await prisma.location.findFirst({
            where: {
                slug,
            },
        })
        res.status(200)
        res.json({ site })
    } catch (e) {
        res.status(500)
        res.json({
            error: `Unable to fetch site from database - ${e}`,
        })
    }
}

export default withSentry(handler)
