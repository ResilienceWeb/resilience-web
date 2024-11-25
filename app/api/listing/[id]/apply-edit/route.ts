import { auth } from '@auth'
import prisma from '@prisma-rw'
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

    // Update the listing with the edited values
    const updatedListing = await prisma.listing.update({
      where: {
        id: parseInt(listingId),
      },
      data: {
        title: listingEdit.title,
        description: listingEdit.description,
        website: listingEdit.website,
        facebook: listingEdit.facebook,
        twitter: listingEdit.twitter,
        instagram: listingEdit.instagram,
        email: listingEdit.email,
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

    return Response.json({
      listing: updatedListing,
    })
  } catch (e) {
    console.error(`[RW] Unable to apply listing edit - ${e}`)
    return new Response(`Unable to apply listing edit - ${e}`, {
      status: 500,
    })
  }
}
