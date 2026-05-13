import type { NextRequest } from 'next/server'
import { Prisma } from '@prisma-client'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { sendEmail } from '@helpers/email'
import { flattenListingPlacement } from '@helpers/flattenPlacement'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'
import ListingCreatedEmail from '@components/emails/ListingCreatedEmail'
import ListingProposedAdminEmail from '@components/emails/ListingProposedAdminEmail'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const web = searchParams.get('web')

  try {
    const placementWhere = web
      ? { web: { slug: web, deletedAt: null } }
      : { web: { deletedAt: null } }

    const listings = await prisma.listing.findMany({
      where: {
        placements: { some: placementWhere },
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
        placements: {
          include: {
            web: { select: { id: true, slug: true, title: true } },
            category: {
              select: { id: true, color: true, label: true },
            },
            tags: { select: { id: true, label: true } },
          },
        },
        relations: {
          include: {
            placements: {
              include: {
                category: {
                  select: { id: true, color: true, label: true },
                },
              },
            },
          },
        },
        edits: {
          where: {
            accepted: false,
          },
        },
      },
      orderBy: [{ id: 'asc' }],
    })

    // For each listing, pick the placement matching the current web context for flatten,
    // and surface a list of OTHER webs so the admin's delete confirmation can show
    // "stays in Cambridge, Durham" instead of pretending to delete the listing.
    const flattened = listings.map((l) => {
      const matching = l.placements.find((p) =>
        web ? p.web.slug === web : true,
      )
      const others = l.placements
        .filter((p) => p.id !== matching?.id)
        .map((p) => ({
          webId: p.webId,
          slug: p.slug,
          web: p.web,
        }))
      const flat = flattenListingPlacement({
        ...l,
        placements: matching ? [matching] : [],
      })
      return { ...flat, sharedWith: others }
    })
    return Response.json({ listings: flattened })
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
    const proposerId = formData.get('proposerId')
    const webId = parseInt(formData.get('webId'))
    const category = parseInt(formData.get('category'))
    const title = formData.get('title')
    const website = formData.get('website')
    const description = formData.get('description')
    const email = formData.get('email')
    const seekingVolunteers = formData.get('seekingVolunteers')
    const featured = formData.get('featured')
    const featuredDate = featured ? new Date(featured as string) : null
    const latitude = formData.get('latitude')
    const longitude = formData.get('longitude')
    const locationDescription = formData.get('locationDescription')
    const slug = formData.get('slug')
    const socials = formData.get('socials')
    const actions = formData.get('actions')

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
    const socialsData = socials ? JSON.parse(socials) : []
    const actionsData = actions ? JSON.parse(actions) : []

    const newData: Prisma.ListingCreateInput = {
      title: title,
      description: description,
      email: email,
      website: website,
      socials: {
        create: socialsData.map((social) => ({
          platform: social.platform,
          url: social.url,
        })),
      },
      actions: {
        create: actionsData.map((action) => ({
          type: action.type,
          url: action.url,
        })),
      },
      pending: isProposedListing,
      proposer: {
        ...(proposerId
          ? {
              connect: {
                id: proposerId,
              },
            }
          : {}),
      },
      seekingVolunteers: stringToBoolean(seekingVolunteers),
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
      relations: {
        connect: relationsToConnect,
      },
      relationOf: {
        connect: relationsToConnect,
      },
      placements: {
        create: {
          web: { connect: { id: webId } },
          slug: slug as string,
          ...(category ? { category: { connect: { id: category } } } : {}),
          featured: isProposedListing ? null : featuredDate,
          ...(tagsToConnect.length > 0 && { tags: { connect: tagsToConnect } }),
        },
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
      include: {
        placements: { where: { webId }, include: { web: true } },
      },
    })

    const selectedWeb = await prisma.web.findFirst({
      where: {
        id: webId,
        deletedAt: null,
      },
      include: {
        webAccess: {
          include: {
            user: true,
          },
        },
      },
    })

    const placementSlug = listing.placements[0]?.slug ?? ''
    if (listing.email && selectedWeb?.contactEmail) {
      const listingUrl = `https://${selectedWeb.slug}.resilienceweb.org.uk/${placementSlug}`
      sendEmail({
        to: listing.email,
        subject: `A listing for ${listing.title} has been created on ${selectedWeb.title} Resilience Web`,
        email: ListingCreatedEmail({
          listingTitle: listing.title,
          webTitle: selectedWeb.title,
          listingUrl,
        }),
        replyTo: selectedWeb.contactEmail,
      })
    }

    if (isProposedListing && selectedWeb) {
      const proposer = await prisma.user.findUnique({
        where: {
          id: proposerId,
        },
      })

      const listingProposedEmailComponent = ListingProposedAdminEmail({
        proposedListingTitle: listing.title,
        proposerEmail: proposer?.email,
        webTitle: `${selectedWeb.title}`,
        url: `${PROTOCOL}://${REMOTE_HOSTNAME}/admin`,
      })

      const emails = selectedWeb.webAccess
        .filter((access) => access.role === 'OWNER' && access.user?.emailVerified)
        .map((access) => access.email)
      emails.forEach((email) => {
        sendEmail({
          to: email,
          subject: `New listing proposed for ${selectedWeb.title} Resilience Web: ${listing.title}`,
          email: listingProposedEmailComponent,
        })
      })
    }

    return Response.json(
      {
        listing: flattenListingPlacement(listing),
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
