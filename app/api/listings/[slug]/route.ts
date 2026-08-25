import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import { requireWebEditor } from '@/lib/api-authorization'
import { Prisma } from '@prisma-client'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import deleteImage from '@helpers/deleteImage'
import { sendEmail } from '@helpers/email'
import { flattenListingPlacement } from '@helpers/flattenPlacement'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'
import ListingCreatedEmail from '@components/emails/ListingCreatedEmail'
import ListingProposedAcceptedEmail from '@components/emails/ListingProposedAcceptedEmail'

function exclude(data, keys) {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !keys.includes(key)),
  )
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> },
) {
  const params = await props.params
  try {
    const slug = params.slug
    const searchParams = request.nextUrl.searchParams
    const webSlug = searchParams.get('web')

    const placementWhere = {
      slug,
      web: {
        deletedAt: null,
        ...(webSlug ? { slug: { contains: webSlug } } : {}),
      },
    }

    const listingRaw = await prisma.listing.findFirst({
      where: { placements: { some: placementWhere } },
      include: {
        socials: true,
        actions: true,
        proposer: true,
        location: true,
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
      },
    })

    if (!listingRaw) {
      return Response.json({ listing: null })
    }

    // Pick the placement matching the current web context so flattenListingPlacement
    // hoists the right slug/category/tags onto the listing.
    const matchingPlacement = listingRaw.placements.find(
      (p) => p.slug === slug && (!webSlug || p.web.slug.includes(webSlug)),
    )
    const otherPlacements = listingRaw.placements.filter(
      (p) => p.id !== matchingPlacement?.id,
    )

    const flattened = flattenListingPlacement({
      ...listingRaw,
      placements: matchingPlacement ? [matchingPlacement] : [],
    })

    const listingWithoutRedundantFields = exclude(
      {
        ...flattened,
        // For the admin form: which other webs this listing also lives in
        // (used to show the "shared with N webs" banner).
        sharedWith: otherPlacements.map((p) => ({
          webId: p.webId,
          slug: p.slug,
          web: p.web,
        })),
      },
      ['createdAt', 'updatedAt', 'notes'],
    )

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

/**
 * `prisma.listing.update` is keyed on the listing alone, so the placement has to
 * be established before the caller can be checked against anything.
 */
async function resolvePlacementWebId(
  listingId: number,
  requestedWebId: number | undefined,
) {
  const existing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { placements: { select: { webId: true } } },
  })

  if (!existing) {
    return { error: new Response('Listing not found', { status: 404 }) }
  }

  if (requestedWebId === undefined) {
    if (existing.placements.length !== 1) {
      return {
        error: new Response(
          'Listing exists in multiple webs; webId is required to disambiguate',
          { status: 400 },
        ),
      }
    }
    return { webId: existing.placements[0].webId }
  }

  if (!existing.placements.some((p) => p.webId === requestedWebId)) {
    return {
      error: new Response('Listing not found in this web', { status: 404 }),
    }
  }

  return { webId: requestedWebId }
}

export async function PUT(request) {
  try {
    const formData = await request.formData()
    const listingId = formData.get('id')

    const formWebId = formData.get('webId')
    const { webId: placementWebId, error } = await resolvePlacementWebId(
      Number(listingId),
      formWebId ? Number(formWebId) : undefined,
    )
    if (error) return error

    const denied = await requireWebEditor(request, placementWebId)
    if (denied) return denied

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
    const inactive = formData.get('inactive')
    const featured = formData.get('featured')
    const featuredDate = featured ? new Date(featured as string) : null
    const latitude = formData.get('latitude')
    const longitude = formData.get('longitude')
    const locationDescription = formData.get('locationDescription')
    const noPhysicalLocation = stringToBoolean(
      formData.get('noPhysicalLocation'),
    )
    const removeLocation = stringToBoolean(formData.get('removeLocation'))
    const slug = formData.get('slug')
    const socials = formData.get('socials')
    const actions = formData.get('actions')

    const socialsData = socials ? JSON.parse(socials) : []
    const actionsData = actions ? JSON.parse(actions) : []

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

    const hasLocationData = latitude && longitude && locationDescription
    let locationData: Prisma.ListingLocationUpdateOneWithoutListingNestedInput =
      {}
    if (hasLocationData) {
      locationData = {
        upsert: {
          create: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            description: locationDescription,
            noPhysicalLocation,
          },
          update: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            description: locationDescription,
            noPhysicalLocation,
          },
        },
      }
    } else if (noPhysicalLocation) {
      locationData = {
        upsert: {
          create: {
            latitude: null,
            longitude: null,
            description: null,
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
    } else if (removeLocation) {
      locationData = { disconnect: true }
    }

    const newData: Prisma.ListingUpdateInput = {
      title: title,
      website: website,
      description: description,
      email: email,
      pending: false,
      seekingVolunteers: stringToBoolean(seekingVolunteers),
      inactive: stringToBoolean(inactive),
      location: locationData,
      socials: {
        deleteMany: {}, // Remove all existing social media entries
        create: socialsData.map((social) => ({
          platform: social.platform,
          url: social.url,
        })),
      },
      actions: {
        deleteMany: {}, // Remove all existing action buttons
        create: actionsData.map((action) => ({
          type: action.type,
          url: action.url,
        })),
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
      // User is uploading a new image
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
    } else if (image === 'null') {
      // User explicitly removed the image
      const { image: oldImageKey } = await prisma.listing.findUnique({
        where: { id: Number(listingId) },
        select: {
          image: true,
        },
      })

      if (oldImageKey) {
        await deleteImage(oldImageKey)
      }
      newData.image = null
    }

    const placementUpdate: Prisma.ListingPlacementUpdateInput = {
      slug: slug as string,
      featured: featuredDate,
      category: category ? { connect: { id: category } } : { disconnect: true },
      tags: {
        connect: tagsToConnect,
        disconnect: tagsToDisconnect,
      },
    }

    const [listing] = await prisma.$transaction([
      prisma.listing.update({
        where: { id: Number(listingId) },
        data: newData,
        include: {
          socials: true,
          actions: true,
          proposer: true,
          location: {
            select: {
              latitude: true,
              longitude: true,
              description: true,
            },
          },
          placements: {
            where: { webId: placementWebId },
            include: {
              web: true,
              category: { select: { id: true, color: true, label: true } },
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
        },
      }),
      prisma.listingPlacement.update({
        where: {
          listingPlacementPair: {
            listingId: Number(listingId),
            webId: placementWebId,
          },
        },
        data: placementUpdate,
      }),
    ])

    const refreshed = await prisma.listing.findUnique({
      where: { id: Number(listingId) },
      include: {
        socials: true,
        actions: true,
        proposer: true,
        location: {
          select: { latitude: true, longitude: true, description: true },
        },
        placements: {
          where: { webId: placementWebId },
          include: {
            web: true,
            category: { select: { id: true, color: true, label: true } },
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
      },
    })

    const flattened = flattenListingPlacement(refreshed)
    const placement = refreshed.placements[0]

    const isApprovingProposedListing = formData.get(
      'isApprovingProposedListing',
    )
    if (isApprovingProposedListing && placement?.web) {
      await sendEmail({
        to: listing.proposer.email,
        subject: `Your proposed listing ${listing.title} has been accepted`,
        email: ListingProposedAcceptedEmail({
          webTitle: placement.web.title,
          listingTitle: listing.title,
          listingSlug: placement.slug,
          webSlug: placement.web.slug,
        }),
      })

      if (listing.email && placement.web.contactEmail) {
        const listingUrl = `https://${placement.web.slug}.resilienceweb.org.uk/${placement.slug}`
        await sendEmail({
          to: listing.email,
          subject: `A listing for ${listing.title} has been created on ${placement.web.title} Resilience Web`,
          email: ListingCreatedEmail({
            listingTitle: listing.title,
            webTitle: placement.web.title,
            listingUrl,
          }),
          replyTo: placement.web.contactEmail,
        })
      }
    }

    if (placement?.web) {
      revalidatePath(`/${placement.web.slug}/${placement.slug}`)
      revalidatePath(`/${placement.web.slug}`)
    }

    return Response.json({ listing: flattened })
  } catch (e) {
    console.error(`[RW] Unable to update listing - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to update listing - ${e}`, {
      status: 500,
    })
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> },
) {
  const params = await props.params
  try {
    const slug = params.slug
    const { webId } = await request.json()

    if (!Number.isInteger(webId)) {
      return Response.json({ error: 'webId is required' }, { status: 400 })
    }

    const denied = await requireWebEditor(request, webId)
    if (denied) return denied

    const placement = await prisma.listingPlacement.findUnique({
      where: { webSlug: { webId, slug } },
      include: {
        web: { select: { slug: true } },
        listing: { include: { placements: { select: { id: true } } } },
      },
    })

    if (!placement) {
      return new Response('Listing not found in this web', { status: 404 })
    }

    const isOnlyPlacement = placement.listing.placements.length === 1
    const { placements: _omit, ...listingFields } = placement.listing

    if (isOnlyPlacement) {
      // Last web: remove the listing entirely (cascade clears the placement).
      const deleted = await prisma.listing.delete({
        where: { id: placement.listingId },
      })

      if (deleted.locationId) {
        await prisma.listingLocation.delete({
          where: { id: deleted.locationId },
        })
      }

      if (deleted.image) {
        await deleteImage(deleted.image)
      }
    } else {
      // Other webs still hold this listing — just detach this placement.
      await prisma.listingPlacement.delete({ where: { id: placement.id } })
    }

    if (placement.web) {
      revalidatePath(`/${placement.web.slug}/${slug}`)
      revalidatePath(`/${placement.web.slug}`)
    }

    return Response.json({ listing: listingFields })
  } catch (e) {
    console.error(`[RW] Unable to delete listing - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to delete listing - ${e}`, {
      status: 500,
    })
  }
}
