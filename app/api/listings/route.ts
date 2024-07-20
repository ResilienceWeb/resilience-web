import prisma from '../../../prisma/client'

export async function GET(request) {
  const { web } = request.query ?? {}
  try {
    const listings = await prisma.listing.findMany({
      where: {
        ...(web
          ? {
              web: {
                slug: {
                  contains: web,
                },
              },
            }
          : {}),
      },
      include: {
        location: {
          select: {
            latitude: true,
            longitude: true,
            description: true,
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
