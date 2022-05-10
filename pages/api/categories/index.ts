import { Category } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { withSentry } from '@sentry/nextjs'
import prisma from '../../../prisma/client'

type ResponseData = {
    error?: string
    data?: Category | Category[]
}

const DEFAULT_LOCATION_SLUG = 'cambridge-city'

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>,
) => {
    try {
        const { site } = req.query

        switch (req.method) {
            case 'GET': {
                const categories: Category[] = await prisma.category.findMany({
                    where: {
                        location: {
                            slug: {
                                contains: site ?? DEFAULT_LOCATION_SLUG,
                            },
                        },
                    },
                    orderBy: [
                        {
                            id: 'asc',
                        },
                    ],
                })
                res.status(200)
                res.json({ data: categories })

                break
            }
            case 'POST': {
                const category = await prisma.category.create({
                    data: req.body,
                })
                res.status(201)
                res.json({ data: category })

                break
            }
        }
    } catch (e) {
        res.status(500)
        res.json({
            error: `Unable to ${req.method} process database operation - ${e}`,
        })
    }
}

export default withSentry(handler)
