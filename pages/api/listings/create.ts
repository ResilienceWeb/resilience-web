import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import type { File } from 'formidable'
import { getSession } from 'next-auth/react'
import { withSentry } from '@sentry/nextjs'
import { Prisma } from '@prisma/client'
import prisma from '../../../prisma/client'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'

const generateSlug = (title) => title.toLowerCase().replace(/ /g, '-')

type ResponseData = {
    error?: string
    listing?: Listing // TODO: change to 'data'
}

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>,
) => {
    try {
        const session = await getSession({ req })
        if (!session?.user?.admin) {
            res.status(403)
            res.json({
                error: `You don't have enough permissions to access this data.`,
            })
        }

        if (req.method !== 'POST') {
            res.status(500)
            res.json({
                error: `Method ${req.method} not supported at this endpoint`,
            })
        }

        const form = formidable({
            keepExtensions: true,
            allowEmptyFiles: false,
            maxFileSize: 5 * 1024 * 1024,
        })

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        void form.parse(req, async (_err, fields, files) => {
            const newData: Prisma.ListingUncheckedCreateInput = {
                title: fields.title as string,
                categoryId: parseInt(fields.category as string),
                locationId: parseInt(fields.locationId as string),
                website: fields.website as string,
                description: fields.description as string,
                email: fields.email as string,
                facebook: fields.facebook as string,
                instagram: fields.instagram as string,
                twitter: fields.twitter as string,
                notes: fields.notes as string,
                seekingVolunteers: stringToBoolean(
                    fields.seekingVolunteers as string,
                ),
                inactive: stringToBoolean(fields.inactive as string),
                slug: generateSlug(fields.title),
            }

            let imageUrl = null
            if (files.image) {
                imageUrl = await uploadImage(files.image as File)
            }
            if (imageUrl) {
                newData.image = imageUrl
            }

            const listing = await prisma.listing.create({
                data: newData,
            })

            res.status(201)
            res.json({ listing })
        })
    } catch (e) {
        res.status(500)
        res.json({
            error: `Unable to save listing to database - ${e}`,
        })
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
}

export default withSentry(handler)
