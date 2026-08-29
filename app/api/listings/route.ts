import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import { callerCanEditWeb, getCaller } from '@/lib/api-authorization'
import { sanitizeRichText } from '@/lib/sanitize-rich-text'
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

  if (!web) {
    return Response.json({ error: 'web is required' }, { status: 400 })
  }

  try {
    const placementWhere = { web: { slug: web, deletedAt: null } }

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
          // Only the count is read, and the full rows carry every proposed
          // title, description and image.
          select: { id: true },
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

/**
 * Deliberately reachable without a session: this backs the propose-a-listing
 * form anonymous visitors use. The admin form posts here too with
 * `pending=false`, so every field that decides whether a listing goes live comes
 * from the caller's rights over `webId`, never from the body.
 */
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
    const description = sanitizeRichText(formData.get('description'))
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

    if (!Number.isInteger(webId)) {
      return Response.json({ error: 'webId is required' }, { status: 400 })
    }

    const web = await prisma.web.findFirst({
      where: { id: webId, deletedAt: null },
      select: { id: true },
    })
    if (!web) {
      return Response.json({ error: 'Web not found' }, { status: 404 })
    }

    const caller = await getCaller(request)
    const callerIsEditor = await callerCanEditWeb(caller, webId)

    // Everyone else gets a proposal, whatever the form said.
    const isProposedListing = callerIsEditor ? stringToBoolean(pending) : true

    // Whoever is signed in, never whoever the body names. Anonymous proposals
    // are allowed and simply have none.
    const proposerId = caller?.id

    const socialsData = socials ? JSON.parse(socials) : []
    const actionsData = actions ? JSON.parse(actions) : []

    // Tags and categories are per-web, so only this web's may be attached.
    const requestedTagIds = (
      typeof tags === 'string' && tags !== '' ? tags.split(',') : []
    )
      .map(Number)
      .filter(Number.isInteger)
    const tagsToConnect =
      requestedTagIds.length > 0
        ? await prisma.tag.findMany({
            where: { id: { in: requestedTagIds }, webId },
            select: { id: true },
          })
        : []

    const categoryInThisWeb = Number.isInteger(category)
      ? await prisma.category.findFirst({
          where: { id: category, webId },
          select: { id: true },
        })
      : null

    // Relating writes to the *other* listing too, so it stays an editor action.
    const relationsToConnect = callerIsEditor
      ? (typeof relations === 'string' && relations !== ''
          ? relations.split(',')
          : []
        )
          .map(Number)
          .filter(Number.isInteger)
          .map((id) => ({ id }))
      : []

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
          ...(categoryInThisWeb
            ? { category: { connect: { id: categoryInThisWeb.id } } }
            : {}),
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
    if (!isProposedListing && listing.email && selectedWeb?.contactEmail) {
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
      const proposer = proposerId
        ? await prisma.user.findUnique({
            where: {
              id: proposerId,
            },
          })
        : null

      const listingProposedEmailComponent = ListingProposedAdminEmail({
        proposedListingTitle: listing.title,
        proposerEmail: proposer?.email,
        webTitle: `${selectedWeb.title}`,
        url: `${PROTOCOL}://${REMOTE_HOSTNAME}/admin`,
      })

      const emails = selectedWeb.webAccess
        .filter(
          (access) => access.role === 'OWNER' && access.user?.emailVerified,
        )
        .map((access) => access.email)
      emails.forEach((email) => {
        sendEmail({
          to: email,
          subject: `New listing proposed for ${selectedWeb.title} Resilience Web: ${listing.title}`,
          email: listingProposedEmailComponent,
        })
      })
    }

    if (!isProposedListing && selectedWeb) {
      revalidatePath(`/${selectedWeb.slug}`)
      revalidatePath(`/${selectedWeb.slug}/${placementSlug}`)
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
