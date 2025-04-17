import { Prisma } from '@prisma/client'
import type { Web } from '@prisma/client'
import prisma from '@prisma-rw'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'
import { auth } from '@auth'

type Data = {
  web: Web
}

export async function GET(request, props) {
  const params = await props.params
  const slug = params.slug

  const searchParams = request.nextUrl.searchParams
  const withListingsParam = searchParams.get('withListings')
  const withAdminInfoParam = searchParams.get('withAdminInfo')
  const withListings = withListingsParam
    ? stringToBoolean(withListingsParam)
    : false
  const withAdminInfo = withAdminInfoParam
    ? stringToBoolean(withAdminInfoParam)
    : false

  const include = Prisma.validator<Prisma.WebInclude>()({
    listings: {},
    permissions: {},
    ownerships: {},
  })

  if (withListings) {
    include.listings = {
      select: {
        id: true,
        webId: true,
      },
    }
  }

  if (withAdminInfo) {
    include.permissions = {
      include: {
        user: true,
      },
    }
    include.ownerships = {
      include: {
        user: true,
      },
    }
  }

  const web: Data['web'] = await prisma.web.findUnique({
    where: {
      slug,
    },
    include,
  })

  return Response.json({
    web,
  })
}

export async function PUT(request, props) {
  const params = await props.params
  const session = await auth()

  if (!session?.user) {
    // TODO: Improve security
  }

  try {
    const slug = params.slug
    const formData = await request.formData()
    const newData: Prisma.WebUncheckedUpdateInput = {
      title: formData.get('title'),
      published: stringToBoolean(formData.get('published')),
      description: formData.get('description'),
    }

    const image = formData.get('image')
    let imageUrl: string | null = null
    if (image && image !== 'undefined' && image !== 'null') {
      const { image: oldImageKey } = await prisma.web.findUnique({
        where: { slug },
      })
      imageUrl = await uploadImage(image, oldImageKey)
      if (imageUrl) {
        newData.image = imageUrl
      }
    }

    const updatedWeb: Data['web'] = await prisma.web.update({
      where: {
        slug,
      },
      data: newData,
    })

    return Response.json({
      web: updatedWeb,
    })
  } catch (e) {
    console.error(`[RW] Unable to update web - ${e}`)
    return new Response(`Unable to update web - ${e}`, {
      status: 500,
    })
  }
}
