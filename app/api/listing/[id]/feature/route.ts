import prisma from '@prisma-rw'

export async function PATCH(_request, { params }) {
  try {
    const listingId = Number(params.id)

    const listing = await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        featured: true,
      },
    })

    return Response.json({
      listing,
    })
  } catch (e) {
    console.error(`[RW] Unable to feature listing - ${e}`)
    return new Response(`Unable to feature listing - ${e}`, {
      status: 500,
    })
  }
}
