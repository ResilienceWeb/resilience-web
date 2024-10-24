import prisma from '@prisma-rw'

export async function PUT(request: Request, { params }) {
  const id = params.id
  const listingIds = await request.json()

  const listingIdsToConnect = listingIds.map((id) => ({ id }))

  try {
    const tag = await prisma.tag.update({
      where: {
        id: Number(id),
      },
      data: {
        listings: {
          connect: listingIdsToConnect,
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
