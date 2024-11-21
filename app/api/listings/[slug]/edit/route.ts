import { auth } from '@auth'
import { stringToBoolean } from '@helpers/utils'
import prisma from '@prisma-rw'

export async function GET(request, { params }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Not authorized', { status: 401 })
    }

    const slug = params.slug
    const searchParams = request.nextUrl.searchParams
    const webSlug = searchParams.get('web')

    console.log(slug, webSlug)

    const listingEdits = await prisma.listingEdit.findMany({
      where: {
        listing: {
          slug,
          ...(webSlug
            ? {
                web: {
                  slug: {
                    contains: webSlug,
                  },
                },
              }
            : {}),
        },
      },
      include: {
        category: {
          select: {
            id: true,
            color: true,
            label: true,
          },
        },
      },
    })

    return Response.json({
      listingEdits,
    })
  } catch (e) {
    console.error(`[RW] Unable to get listing edits - ${e}`)
    return new Response(`Unable to get listing edits - ${e}`, {
      status: 500,
    })
  }
}

export async function POST(request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Not authorized', { status: 401 })
    }

    const formData = await request.formData()
    const listingId = Number(formData.get('listingId'))
    // const userId = Number(formData.get('userId'))
    const tags = formData.get('tags')
    const relations = formData.get('relations')
    const category = parseInt(formData.get('category'))
    const title = formData.get('title')
    const website = formData.get('website')
    const description = formData.get('description')
    const facebook = formData.get('facebook')
    const instagram = formData.get('instagram')
    const twitter = formData.get('twitter')
    const email = formData.get('email')
    const seekingVolunteers = formData.get('seekingVolunteers')
    // const featured = formData.get('featured')
    // const latitude = formData.get('latitude')
    // const longitude = formData.get('longitude')
    // const locationDescription = formData.get('locationDescription')
    const slug = formData.get('slug')

    const listingEdit = await prisma.listingEdit.create({
      data: {
        listing: {
          connect: {
            id: listingId,
          },
        },
        user: {
          connect: {
            id: session.user.id,
          },
        },
        title,
        description,
        email,
        website,
        facebook,
        instagram,
        twitter,
      },
    })

    return Response.json(
      {
        listingEdit,
      },
      {
        status: 201,
      },
    )
  } catch (e) {
    console.error(`[RW] Unable to create listing edit - ${e}`)
    return new Response(`Unable to create listing edit - ${e}`, {
      status: 500,
    })
  }
}
