import { Tag } from '@prisma/client'
import prisma from '@prisma-rw'

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const web = searchParams.get('web')

    const tags: Tag[] = await prisma.tag.findMany({
      include: {
        listings: true,
      },
      where: {
        web: {
          slug: {
            equals: web,
          },
        },
      },
      orderBy: [
        {
          id: 'asc',
        },
      ],
    })

    return Response.json({ data: tags })
  } catch (e) {
    console.error(`[RW] Unable to fetch tags - ${e}`)
    return new Response(`Unable to fetch tags - ${e}`, {
      status: 500,
    })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  try {
    const tag = await prisma.tag.create({
      data: body,
    })

    return Response.json({ data: tag })
  } catch (e) {
    console.error(`[RW] Unable to create tag - ${e}`)
    return new Response(`Unable to create tag - ${e}`, {
      status: 500,
    })
  }
}

export async function PATCH(request: Request) {
  const body = await request.json()

  try {
    const tag = await prisma.tag.update({
      where: {
        id: body.id,
      },
      data: body,
    })

    return Response.json({ data: tag })
  } catch (e) {
    console.error(`[RW] Unable to update tag - ${e}`)
    return new Response(`Unable to update tag - ${e}`, {
      status: 500,
    })
  }
}
