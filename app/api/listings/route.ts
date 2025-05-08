import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { sendEmail } from '@helpers/email'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'
import ListingProposedEmail from '@components/emails/ListingProposedEmail'

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const web = searchParams.get('web')

  try {
    const listings = await prisma.listing.findMany({
      where: {
        ...(web
          ? {
              web: {
                slug: web,
              },
            }
          : {}),
      },
      include: {
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
        web: true,
        tags: {
          select: {
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
        edits: true,
      },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    })
    return Response.json({
      listings,
    })
  } catch (e) {
    console.error(`[RW] Unable to fetch listings - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to fetch listings - ${e}`, {
      status: 500,
    })
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const tags = formData.get('tags')
    const relations = formData.get('relations')
    const pending = formData.get('pending')
    const webId = parseInt(formData.get('webId'))
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
    const slug = formData.get('slug')
    const socials = formData.get('socials')

    // Prepare tags
    const tagsArray = tags !== '' ? tags.split(',') : []
    const tagsToConnect = tagsArray.map((tagId) => ({
      id: Number(tagId),
    }))

    // Prepare relations
    const relationsArray = relations !== '' ? relations.split(',') : []
    const relationsToConnect = relationsArray.map((relationId) => ({
      id: Number(relationId),
    }))

    const isProposedListing = stringToBoolean(pending)
    // Parse socials data if it exists
    const socialsData = socials ? JSON.parse(socials) : []

    const newData: Prisma.ListingCreateInput = {
      title: title,
      category: {
        connect: {
          id: category,
        },
      },
      web: {
        connect: {
          id: webId,
        },
      },
      description: description,
      email: email,
      website: website,
      socials: {
        create: socialsData.map((social) => ({
          platform: social.platform,
          url: social.url,
        })),
      },
      pending: isProposedListing,
      seekingVolunteers: stringToBoolean(seekingVolunteers),
      featured: isProposedListing ? false : stringToBoolean(featured),
      slug: slug,
      location: {
        ...(latitude && longitude && locationDescription
          ? {
              create: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                description: locationDescription,
              },
            }
          : {}),
      },
      tags: {
        connect: tagsToConnect,
      },
      relations: {
        connect: relationsToConnect,
      },
      relationOf: {
        connect: relationsToConnect,
      },
    }

    const image = formData.get('image')
    let imageUrl: string | null = null
    if (image && image !== 'undefined') {
      imageUrl = await uploadImage(image)
      if (imageUrl) {
        newData.image = imageUrl
      }
    }

    const listing = await prisma.listing.create({
      data: newData,
    })

    if (isProposedListing) {
      const selectedWeb = await prisma.web.findUnique({
        where: {
          id: webId,
        },
        include: {
          ownerships: {
            select: {
              email: true,
            },
          },
        },
      })

      const webCreatedEmailComponent = ListingProposedEmail({
        proposedListingTitle: listing.title,
        webTitle: `${selectedWeb.title}`,
        url: `${PROTOCOL}://${REMOTE_HOSTNAME}/admin`,
      })

      const emails = selectedWeb.ownerships.map((ownership) => ownership.email)
      emails.forEach((email) => {
        sendEmail({
          to: email,
          subject: `New listing proposed for ${selectedWeb.title} Resilience Web: ${listing.title}`,
          email: webCreatedEmailComponent,
        })
      })
    }

    return Response.json(
      {
        listing,
      },
      {
        status: 201,
      },
    )
  } catch (e) {
    console.error(`[RW] Unable to create listing - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to create listing - ${e}`, {
      status: 500,
    })
  }
}
