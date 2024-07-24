import { getServerSession } from 'next-auth'
import { Prisma } from '@prisma/client'
import prisma from '../../../prisma/client'
import { authOptions } from '../../auth'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'
import ListingProposedEmail from '@components/emails/ListingProposedEmail'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { sendEmail } from '@helpers/email'

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const web = searchParams.get('web')

  try {
    const listings = await prisma.listing.findMany({
      where: {
        ...(web
          ? {
              web: {
                slug: {
                  contains: web,
                },
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
    return new Response(`Unable to fetch listings - ${e}`, {
      status: 500,
    })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      // TODO: Improve security
    }

    const formData = await request.formData()
    const tags = formData.get('tags')
    const relations = formData.get('relations')
    const pending = formData.get('pending')
    const webId = parseInt(formData.get('webId'))
    const category = parseInt(formData.get('category'))
    const title = formData.get('title')
    const website = formData.get('website')
    const description = formData.get('description')
    const facebook = formData.get('facebook')
    const instagram = formData.get('instagram')
    const twitter = formData.get('twitter')
    const email = formData.get('email')
    const seekingVolunteers = formData.get('seekingVolunteers')
    const featured = formData.get('featured')
    const latitude = formData.get('latitude')
    const longitude = formData.get('longitude')
    const slug = formData.get('slug')

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
      website: website,
      description: description,
      email: email,
      facebook: facebook,
      instagram: instagram,
      twitter: twitter,
      pending: isProposedListing,
      seekingVolunteers: stringToBoolean(seekingVolunteers),
      featured: isProposedListing ? false : stringToBoolean(featured),
      slug: slug,
      location: {
        ...(latitude && longitude
          ? {
              create: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
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
      emails.forEach(async (email) => {
        await sendEmail({
          to: email,
          subject: `Someone proposed a new listing for the ${selectedWeb.title} Resilience Web 🎉`,
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
    return new Response(`Unable to create listing - ${e}`, {
      status: 500,
    })
  }
}
