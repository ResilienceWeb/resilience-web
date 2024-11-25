import prisma from '@prisma-rw'

export async function PUT(request: Request, props) {
  const params = await props.params
  const id = params.id
  const { addedListingIds, removedListingIds } = await request.json()

  const listingIdsToConnect = addedListingIds.map((id) => ({ id }))
  const listingIdsToDisconnect = removedListingIds.map((id) => ({ id }))

  try {
    const tag = await prisma.tag.update({
      where: {
        id: Number(id),
      },
      data: {
        listings: {
          connect: listingIdsToConnect,
          disconnect: listingIdsToDisconnect,
        },
      },
    })

    return Response.json({ data: tag })
  } catch (e) {
    console.error(`[RW] Unable to add tag to listings - ${e}`)
    return new Response(`Unable to add tag to listings - ${e}`, {
      status: 500,
    })
  }
}
