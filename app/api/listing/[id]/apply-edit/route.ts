import { auth } from '@auth'
import prisma from '@prisma-rw'

export async function POST(request, { params }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Not authorized', { status: 401 })
    }

    const listingId = params.id
    const { listingEditId } = await request.json()

    // Get the listing edit
    const listingEdit = await prisma.listingEdit.findUnique({
      where: {
        id: listingEditId,
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
