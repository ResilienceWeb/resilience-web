import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import type { Web } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { auth } from '@auth'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'

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
    features: {},
    relations: {},
    location: {},
  })

  if (withListings) {
    include.listings = {
      include: {
        location: true,
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
    include.features = true
    include.relations = true
    include.location = true
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
    return new Response('Unauthorized', {
      status: 403,
    })
  }

  const userOwnerships = await prisma.ownership.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      webs: true,
    },
  })

  const isWebOwner = userOwnerships?.webs.some(
    (web) => web.slug === params.slug,
  )
  if (!isWebOwner && !session?.user.admin) {
    return new Response('Unauthorized', {
      status: 403,
    })
  }

  try {
    const slug = params.slug
    const formData = await request.formData()
    const relatedWebIds = formData.get('relatedWebIds')
    const relationsArray = relatedWebIds !== '' ? relatedWebIds.split(',') : []
    const relationsToConnect = relationsArray.map((relationId) => ({
      id: Number(relationId),
    }))
    const latitude = formData.get('latitude')
    const longitude = formData.get('longitude')
    const locationDescription = formData.get('locationDescription')

    const locationData = {
      ...(latitude && longitude && locationDescription
        ? {
            upsert: {
              create: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                description: locationDescription,
              },
              update: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                description: locationDescription,
              },
            },
          }
        : {}),
    }

    const newData: Prisma.WebUpdateInput = {
      title: formData.get('title'),
      published: stringToBoolean(formData.get('published')),
      contactEmail: formData.get('contactEmail'),
      description: formData.get('description'),
      relations: {
        set: relationsToConnect,
      },
      location: locationData,
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

    revalidatePath(`/${params.slug}`)
    return Response.json({
      web: updatedWeb,
    })
  } catch (e) {
    console.error(`[RW] Unable to update web - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to update web - ${e}`, {
      status: 500,
    })
  }
}

export async function PATCH(request, props) {
  const params = await props.params
  const session = await auth()

  if (!session?.user.admin) {
    return new Response('Unauthorized', {
      status: 403,
    })
  }

  try {
    const slug = params.slug
    const { feature, enabled, webId } = await request.json()

    const updatedWeb: Data['web'] = await prisma.web.update({
      where: {
        slug,
      },
      data: {
        features: {
          upsert: {
            where: {
              webId_feature: {
                webId,
                feature,
              },
            },
            update: {
              enabled,
            },
            create: {
              feature,
              enabled,
            },
          },
        },
      },
    })

    revalidatePath(`/${params.slug}`)

    return Response.json({
      web: updatedWeb,
    })
  } catch (e) {
    console.error(`[RW] Unable to update web - ${e}`)
    Sentry.captureException(e)
    return new Response(`Unable to update web - ${e}`, {
      status: 500,
    })
  }
}
