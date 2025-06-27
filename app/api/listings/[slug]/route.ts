import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import deleteImage from '@helpers/deleteImage'
import { sendEmail } from '@helpers/email'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'
import ListingProposedAcceptedEmail from '@components/emails/ListingProposedAcceptedEmail'

function exclude(data, keys) {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !keys.includes(key)),
  )
}

export async function GET(request, props) {
  const params = await props.params
  try {
    const slug = params.slug
    const searchParams = request.nextUrl.searchParams
    const webSlug = searchParams.get('web')

    const listing = await prisma.listing.findFirst({
      where: {
        slug,
        ...(webSlug
          ? {
              web: {
                slug: {
                  contains: webSlug,
                },
              },
            }
          : {}),
      },
      include: {
        socials: true,
        proposer: true,
        location: {
          select: {
            latitude: true,
            longitude: true,
            description: true,
            noPhysicalLocation: true,
          },
        },
        category: {
          select: {
            id: true,
            color: true,
            label: true,
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
    })

    const listingWithoutRedundantFields = exclude(listing, [
      'createdAt',
      'updatedAt',
      'notes',
      'inactive',
    ])

    return Response.json({
      listing: listingWithoutRedundantFields,
    })
  } catch (e) {
    console.error(`[RW] Unable to fetch listing - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to fetch listing - ${e}`, {
      status: 500,
    })
  }
}

export async function PUT(request) {
  try {
    const formData = await request.formData()
    const listingId = formData.get('id')
    const tags = formData.get('tags')
    const removedTags = formData.get('removedTags')
    const relations = formData.get('relations')
    const removedRelations = formData.get('removedRelations')
    const category = parseInt(formData.get('category'))
    const title = formData.get('title')
    const website = formData.get('website')
    const description = formData.get('description')
    const email = formData.get('email')
    const seekingVolunteers = formData.get('seekingVolunteers')
    const featured = formData.get('featured')
    const latitude = formData.get('latitude')
    const longitude = formData.get('longitude')
    const locationDescription = formData.get('locationDescription')
    const noPhysicalLocation = stringToBoolean(
      formData.get('noPhysicalLocation'),
    )
    const slug = formData.get('slug')
    const socials = formData.get('socials')

    // Parse socials data if it exists
    const socialsData = socials ? JSON.parse(socials) : []

    // Prepare tags
    const tagsArray = tags !== '' ? tags.split(',') : []
    const tagsToConnect = tagsArray.map((tagId) => ({
      id: Number(tagId),
    }))
    const removedTagsArray = removedTags !== '' ? removedTags.split(',') : []
    const tagsToDisconnect = removedTagsArray.map((tagId) => ({
      id: Number(tagId),
    }))

    // Prepare relations
    const relationsArray = relations !== '' ? relations.split(',') : []
    const relationsToConnect = relationsArray.map((relationId) => ({
      id: Number(relationId),
    }))
    const removedRelationsArray =
      removedRelations !== '' ? removedRelations.split(',') : []
    const relationsToDisconnect = removedRelationsArray?.map((relationId) => ({
      id: Number(relationId),
    }))

    let locationData
    if (noPhysicalLocation) {
      locationData = {
        upsert: {
          create: {
            noPhysicalLocation: true,
          },
          update: {
            latitude: null,
            longitude: null,
            description: null,
            noPhysicalLocation: true,
          },
        },
      }
    } else {
      locationData = {
        ...(latitude && longitude && locationDescription
          ? {
              upsert: {
                create: {
                  latitude: parseFloat(latitude),
                  longitude: parseFloat(longitude),
                  description: locationDescription,
                  noPhysicalLocation: false,
                },
                update: {
                  latitude: parseFloat(latitude),
                  longitude: parseFloat(longitude),
                  description: locationDescription,
                  noPhysicalLocation: false,
                },
              },
            }
          : {}),
      }
    }

    const newData: Prisma.ListingUpdateInput = {
      title: title,
      category: {
        connect: {
          id: category,
        },
      },
      website: website,
      description: description,
      email: email,
      pending: false,
      seekingVolunteers: stringToBoolean(seekingVolunteers),
      featured: stringToBoolean(featured),
      slug: slug,
      location: locationData,
      socials: {
        deleteMany: {}, // Remove all existing social media entries
        create: socialsData.map((social) => ({
          platform: social.platform,
          url: social.url,
        })),
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

    const image = formData.get('image')
    let imageUrl: string | null = null
    if (image && image !== 'undefined' && image !== 'null') {
      const { image: oldImageKey } = await prisma.listing.findUnique({
        where: { id: Number(listingId) },
        select: {
          image: true,
        },
      })

      imageUrl = await uploadImage(image, oldImageKey)
      if (imageUrl) {
        newData.image = imageUrl
      }
    }

    const listing = await prisma.listing.update({
      where: { id: Number(listingId) },
      include: {
        socials: true,
        proposer: true,
        web: true,
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

    const isApprovingProposedListing = formData.get(
      'isApprovingProposedListing',
    )
    if (isApprovingProposedListing) {
      await sendEmail({
        to: listing.proposer.email,
        subject: `Your proposed listing ${listing.title} has been accepted`,
        email: ListingProposedAcceptedEmail({
          webTitle: listing.web.title,
          listingTitle: listing.title,
          listingSlug: listing.slug,
          webSlug: listing.web.slug,
        }),
      })
    }

    return Response.json({
      listing,
    })
  } catch (e) {
    console.error(`[RW] Unable to update listing - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to update listing - ${e}`, {
      status: 500,
    })
  }
}

export async function DELETE(request, props) {
  const params = await props.params
  try {
    const slug = params.slug
    const { webId } = await request.json()

    const listing = await prisma.listing.delete({
      where: { webId_slug: { webId, slug } },
    })

    if (listing.locationId) {
      await prisma.listingLocation.delete({
        where: { id: listing.locationId },
      })
    }

    if (listing.image) {
      await deleteImage(listing.image)
    }

    return Response.json({
      listing,
    })
  } catch (e) {
    console.error(`[RW] Unable to delete listing - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to delete listing - ${e}`, {
      status: 500,
    })
  }
}
