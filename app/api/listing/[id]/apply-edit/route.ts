import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { auth } from '@auth'
import deleteImage from '@helpers/deleteImage'
import { sendEmail } from '@helpers/email'
import ListingEditAcceptedEmail from '@components/emails/ListingEditAcceptedEmail'

export async function POST(request, props) {
  const params = await props.params
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Not authorized', { status: 401 })
    }

    const listingId = params.id
    const { listingEditId } = await request.json()

    // Get the listing edit with related user and listing info
    const listingEdit = await prisma.listingEdit.findUnique({
      where: {
        id: listingEditId,
      },
      include: {
        user: true,
        socials: true,
        category: true,
        listing: {
          include: {
            web: true,
          },
        },
      },
    })

    if (!listingEdit) {
      return new Response('Listing edit not found', { status: 404 })
    }

    const currentListing = await prisma.listing.findUnique({
      where: {
        id: parseInt(listingId),
      },
      include: {
        category: true,
      },
    })

    const newData: Prisma.ListingUpdateInput = {
      title: listingEdit.title,
      description: listingEdit.description,
      website: listingEdit.website,
      email: listingEdit.email,
      category: {
        connect: {
          id: listingEdit.category.id,
        },
      },
      socials: {
        deleteMany: {},
        create: listingEdit.socials.map((social) => ({
          platform: social.platform,
          url: social.url,
        })),
      },
    }

    if (listingEdit.image && listingEdit.image !== currentListing.image) {
      newData.image = listingEdit.image
      if (currentListing.image) {
        await deleteImage(currentListing.image)
      }
    }

    // Update the listing with the edited values
    const updatedListing = await prisma.listing.update({
      where: {
        id: parseInt(listingId),
      },
      data: newData,
      include: {
        web: true,
      },
    })

    // Send email to the user who proposed the edit
    if (listingEdit.user?.email) {
      await sendEmail({
        to: listingEdit.user.email,
        subject: `Your edit to ${listingEdit.title || updatedListing.title} has been accepted`,
        email: ListingEditAcceptedEmail({
          webTitle: listingEdit.listing.web.title,
          listingTitle: listingEdit.title || updatedListing.title,
          listingSlug: listingEdit.listing.slug,
          webSlug: listingEdit.listing.web.slug,
        }),
      })
    }

    // Delete the listing edit since it's been applied
    await prisma.listingEdit.delete({
      where: {
        id: listingEditId,
      },
    })

    revalidatePath(`/${updatedListing.web.slug}/${updatedListing.slug}`)
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
