import prisma from '@prisma-rw'

export async function PATCH(_request, props) {
  const params = await props.params
  try {
    const listingId = Number(params.id)

    const listing = await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        featured: false,
      },
    })

    return Response.json({
      listing,
    })
  } catch (e) {
    console.error(`[RW] Unable to unfeature listing - ${e}`)
    return new Response(`Unable to unfeature listing - ${e}`, {
      status: 500,
    })
  }
}
