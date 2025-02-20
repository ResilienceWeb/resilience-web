import prisma from '@prisma-rw'

export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        image: {
          not: null,
        },
        description: {
          not: '',
        },
        web: {
          published: true,
        },
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
        category: {
          select: {
            id: true,
            color: true,
            label: true,
          },
        },
        web: true,
        tags: {
          select: {
            label: true,
          },
        },
        relations: {
          include: {
            category: {
              select: {
                id: true,
                color: true,
                label: true,
              },
            },
          },
        },
        edits: true,
      },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    })
    return Response.json({
      listings,
    })
  } catch (e) {
    console.error(`[RW] Unable to fetch listings - ${e}`)
    return new Response(`Unable to fetch listings - ${e}`, {
      status: 500,
    })
  }
}
