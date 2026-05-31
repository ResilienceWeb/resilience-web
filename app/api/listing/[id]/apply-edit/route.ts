import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import type { Prisma } from '@prisma-client'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { auth } from '@auth'
import deleteImage from '@helpers/deleteImage'
import { sendEmail } from '@helpers/email'
import ListingEditAcceptedEmail from '@components/emails/ListingEditAcceptedEmail'
import { markListingEditAsAccepted } from '@db/listingEditRepository'

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    if (!session?.user) {
      return new Response('Not authorized', { status: 401 })
    }

    const listingId = params.id
    const { listingEditId } = await request.json()

    const listingEdit = await prisma.listingEdit.findUnique({
      where: {
        id: listingEditId,
      },
      include: {
        user: true,
        socials: true,
        actions: true,
        tags: true,
        category: true,
        location: true,
        web: true,
        listing: true,
      },
    })

    if (!listingEdit) {
      return new Response('Listing edit not found', { status: 404 })
    }

    const placement = await prisma.listingPlacement.findUnique({
      where: {
        listingPlacementPair: {
          listingId: listingEdit.listingId,
          webId: listingEdit.webId,
        },
      },
      include: { web: true },
    })

    if (!placement) {
      return new Response(
        'Placement for this edit no longer exists',
        { status: 404 },
      )
    }

    const currentListing = await prisma.listing.findUnique({
      where: {
        id: parseInt(listingId),
      },
      include: {
        location: true,
      },
    })

    const newData: Prisma.ListingUpdateInput = {
      title: listingEdit.title,
      description: listingEdit.description,
      website: listingEdit.website,
      email: listingEdit.email,
      socials: {
        deleteMany: {},
        create: listingEdit.socials.map((social) => ({
          platform: social.platform,
          url: social.url,
        })),
      },
      actions: {
        deleteMany: {},
        create: listingEdit.actions.map((action) => ({
          type: action.type,
          url: action.url,
        })),
      },
    }

    if (listingEdit.image && listingEdit.image !== currentListing.image) {
      newData.image = listingEdit.image
      if (currentListing.image) {
        await deleteImage(currentListing.image)
      }
    }

    // Handle location data if present in the edit
    if (listingEdit.location) {
      if (currentListing.locationId) {
        // Update existing location
        await prisma.listingLocation.update({
          where: {
            id: currentListing.locationId,
          },
          data: {
            latitude: listingEdit.location.latitude,
            longitude: listingEdit.location.longitude,
            description: listingEdit.location.description,
            noPhysicalLocation: listingEdit.location.noPhysicalLocation,
          },
        })
      } else {
        // Create new location and connect it to the listing
        const newLocation = await prisma.listingLocation.create({
          data: {
            latitude: listingEdit.location.latitude,
            longitude: listingEdit.location.longitude,
            description: listingEdit.location.description,
            noPhysicalLocation: listingEdit.location.noPhysicalLocation,
          },
        })
        newData.location = {
          connect: {
            id: newLocation.id,
          },
        }
      }
    }

    const [updatedListing] = await prisma.$transaction([
      prisma.listing.update({
        where: { id: parseInt(listingId) },
        data: newData,
      }),
      prisma.listingPlacement.update({
        where: { id: placement.id },
        data: {
          ...(listingEdit.categoryId
            ? { category: { connect: { id: listingEdit.categoryId } } }
            : {}),
          // Only overwrite tags when the edit actually carried some, so that
          // approving legacy edits (created before tag support) doesn't wipe
          // the placement's existing tags.
          ...(listingEdit.tags.length > 0
            ? { tags: { set: listingEdit.tags.map((t) => ({ id: t.id })) } }
            : {}),
        },
      }),
    ])

    if (listingEdit.user?.email) {
      await sendEmail({
        to: listingEdit.user.email,
        subject: `Your edit to ${listingEdit.title || updatedListing.title} has been accepted`,
        email: ListingEditAcceptedEmail({
          webTitle: placement.web.title,
          listingTitle: listingEdit.title || updatedListing.title,
          listingSlug: placement.slug,
          webSlug: placement.web.slug,
        }),
      })
    }

    await markListingEditAsAccepted(listingEditId)

    revalidatePath(`/${placement.web.slug}`)

    return Response.json({
      listing: updatedListing,
    })
  } catch (e) {
    console.error(`[RW] Unable to apply listing edit - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to apply listing edit - ${e}`, {
      status: 500,
    })
  }
}
