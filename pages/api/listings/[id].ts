import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../app/auth'
import { Prisma } from '@prisma/client'
import prisma from '../../../prisma/client'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user) {
      res.status(403)
      res.json({
        error: `You don't have enough permissions to access this data.`,
      })
    }

    switch (req.method) {
      case 'PUT': {
        const { id: listingId } = req.query

        const form = formidable({
          keepExtensions: true,
        })

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        form.parse(req, async (_err, fields, files) => {
          // Prepare tags
          const tagsArray =
            fields.tags[0] !== '' ? fields.tags[0].split(',') : []
          const tagsToConnect = tagsArray.map((tagId) => ({
            id: Number(tagId),
          }))
          const removedTagsArray =
            fields.removedTags[0] !== '' ? fields.removedTags : []
          const tagsToDisconnect = removedTagsArray.map((tagId) => ({
            id: Number(tagId),
          }))

          // Prepare relations
          const relationsArray =
            fields.relations[0] !== '' ? fields.relations[0].split(',') : []
          const relationsToConnect = relationsArray.map((relationId) => ({
            id: Number(relationId),
          }))
          const removedRelationsArray =
            fields.removedRelations[0] !== '' ? fields.removedRelations : []
          const relationsToDisconnect = removedRelationsArray.map(
            (relationId) => ({
              id: Number(relationId),
            }),
          )

          const newData: Prisma.ListingUpdateInput = {
            title: fields.title[0],
            category: {
              connect: {
                id: parseInt(fields.category[0]),
              },
            },
            website: fields.website[0],
            description: fields.description[0],
            email: fields.email[0],
            facebook: fields.facebook[0],
            instagram: fields.instagram[0],
            twitter: fields.twitter[0],
            seekingVolunteers: stringToBoolean(fields.seekingVolunteers[0]),
            featured: stringToBoolean(fields.featured[0]),
            pending: false,
            slug: fields.slug[0],
            location: {
              ...(fields?.latitude &&
              fields.latitude[0] &&
              fields?.longitude &&
              fields.longitude[0]
                ? {
                    upsert: {
                      create: {
                        latitude: parseFloat(fields.latitude[0]),
                        longitude: parseFloat(fields.longitude[0]),
                      },
                      update: {
                        latitude: parseFloat(fields.latitude[0]),
                        longitude: parseFloat(fields.longitude[0]),
                      },
                    },
                  }
                : {}),
            },
            tags: {
              connect: tagsToConnect,
              disconnect: tagsToDisconnect,
            },
            relations: {
              connect: relationsToConnect,
              disconnect: relationsToDisconnect,
            },
            relationOf: {
              connect: relationsToConnect,
              disconnect: relationsToDisconnect,
            },
          }

          let imageUrl = null
          if (files.image) {
            const { image: oldImageKey } = await prisma.listing.findUnique({
              where: { id: parseInt(listingId as string) },
              select: {
                image: true,
              },
            })
            imageUrl = await uploadImage(files.image[0], oldImageKey as string)
          }
          if (imageUrl) {
            newData.image = imageUrl
          }

          const listing = await prisma.listing.update({
            where: { id: parseInt(listingId as string) },
            include: {
              location: {
                select: {
                  latitude: true,
                  longitude: true,
                  description: true,
                },
              },
              tags: {
                select: {
                  id: true,
                  label: true,
                },
              },
              relations: {
                include: {
                  category: {
                    select: {
                      id: true,
                      color: true,
                      label: true,
                    },
                  },
                },
              },
            },
            data: newData,
          })

          res.status(200)
          res.json({ listing })
        })

        break
      }
      case 'DELETE': {
        const { id: listingId } = req.query
        const listing = await prisma.listing.delete({
          where: { id: parseInt(listingId as string) },
        })

        await prisma.listingLocation.delete({
          where: { id: listing.locationId },
        })
        res.status(200)
        res.json({ listing })
        break
      }
      default: {
        res.status(400)
        res.json({
          error: `Method ${req.method} not supported at this endpoint`,
        })
        break
      }
    }
  } catch (e) {
    res.status(500)
    res.json({ error: `Unable to update/delete listing - ${e}` })
    console.error(`[RW] Unable to update/delete listing - ${e}`)
  }
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}

export default handler
