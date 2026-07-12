import type { NextRequest } from 'next/server'
import { Prisma } from '@prisma-client'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { getSessionSafe } from '@auth'
import deleteImage from '@helpers/deleteImage'
import { sendMultipleEmails } from '@helpers/email'
import uploadImage from '@helpers/uploadImage'
import { stringToBoolean } from '@helpers/utils'
import ListingEditProposedAdminEmail from '@components/emails/ListingEditProposedAdminEmail'
import { getListingEdits } from '@db/listingEditRepository'

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> },
) {
  const params = await props.params
  try {
    const session = await getSessionSafe(request.headers)
    if (!session?.user) {
      return new Response('Not authorized', { status: 401 })
    }

    const slug = params.slug
    const searchParams = request.nextUrl.searchParams
    const webSlug = searchParams.get('web')

    const listingEdits = await getListingEdits(slug, webSlug)

    return Response.json({
      listingEdits,
    })
  } catch (e) {
    console.error(`[RW] Unable to get listing edits - ${e}`)
    Sentry.captureException(e)
    return new Response(
      "We couldn't load the edits for this listing right now. Please try again in a moment.",
      {
        status: 500,
      },
    )
  }
}

export async function POST(request, props) {
  const params = await props.params
  try {
    const session = await getSessionSafe(request.headers)
    if (!session?.user) {
      return new Response('Not authorized', { status: 401 })
    }

    const placementSlug = params.slug
    const searchParams = request.nextUrl.searchParams
    const webSlug = searchParams.get('web')

    if (!webSlug) {
      return new Response('Missing required query parameter: web', {
        status: 400,
      })
    }

    const formData = await request.formData()
    const listingId = Number(formData.get('listingId'))
    const title = formData.get('title')
    const category = Number(formData.get('category'))
    const website = formData.get('website')
    const description = formData.get('description')
    const email = formData.get('email')
    const socials = formData.get('socials')
    const socialsData = socials ? JSON.parse(socials) : []
    const actions = formData.get('actions')
    const actionsData = actions ? JSON.parse(actions) : []
    const tags = formData.get('tags')
    const tagsData: number[] = tags ? JSON.parse(tags) : []
    const latitude = formData.get('latitude')
    const longitude = formData.get('longitude')
    const locationDescription = formData.get('locationDescription')
    const noPhysicalLocation = stringToBoolean(
      formData.get('noPhysicalLocation'),
    )

    const placement = await prisma.listingPlacement.findFirst({
      where: {
        slug: placementSlug,
        listingId,
        web: { slug: webSlug, deletedAt: null },
      },
      include: { web: true },
    })

    if (!placement) {
      return new Response('Listing not found in this web', { status: 404 })
    }

    const currentListing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
    })

    let locationData
    if (noPhysicalLocation) {
      locationData = {
        create: {
          noPhysicalLocation: true,
        },
      }
    } else {
      locationData = {
        ...(latitude && longitude && locationDescription
          ? {
              create: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                description: locationDescription,
                noPhysicalLocation: false,
              },
            }
          : {}),
      }
    }

    const listingEditData: Prisma.ListingEditCreateInput = {
      title,
      slug: placement.slug,
      listing: {
        connect: {
          id: listingId,
        },
      },
      web: {
        connect: { id: placement.webId },
      },
      user: {
        connect: {
          id: session.user.id,
        },
      },
      category: {
        connect: {
          id: category,
        },
      },
      description,
      email,
      website,
      socials: {
        create: socialsData.map((social) => ({
          platform: social.platform,
          url: social.url,
        })),
      },
      actions: {
        create: actionsData.map((action) => ({
          type: action.type,
          url: action.url,
        })),
      },
      tags: {
        connect: tagsData.map((id) => ({ id })),
      },
      location: locationData,
    }

    const image = formData.get('image')
    let imageUrl: string | null = null
    if (
      image &&
      image !== 'undefined' &&
      image !== 'null' &&
      image !== currentListing.image
    ) {
      imageUrl = await uploadImage(image)
      if (imageUrl) {
        listingEditData.image = imageUrl
      }
    }

    const listingEdit = await prisma.listingEdit.create({
      data: listingEditData,
      include: {
        listing: { select: { id: true, title: true } },
        web: {
          include: {
            webAccess: { include: { user: true } },
          },
        },
      },
    })

    const web = listingEdit.web

    const ownerAndEditorEmails = web.webAccess
      .filter((access) => access.user?.emailVerified)
      .map((access) => access.email)

    await sendMultipleEmails({
      toEmails: ownerAndEditorEmails,
      subject: `New listing edit proposed for ${web.title} Resilience Web`,
      email: ListingEditProposedAdminEmail({
        webTitle: web.title,
        listingTitle: listingEdit.title || listingEdit.listing.title,
      }),
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
    console.error(
      `[RW] Unable to create listing edit - ${JSON.stringify(e, ['message', 'arguments', 'type', 'name'])}`,
    )
    Sentry.captureException(e)
    return new Response(
      "We couldn't save your proposed edit right now. Please try again in a moment.",
      {
        status: 500,
      },
    )
  }
}

export async function DELETE(request, props) {
  const params = await props.params
  try {
    const session = await getSessionSafe(request.headers)
    if (!session) {
      return new Response('Not authorized', { status: 401 })
    }

    const slug = params.slug
    const searchParams = request.nextUrl.searchParams
    const webSlug = searchParams.get('web')

    const placement = await prisma.listingPlacement.findFirst({
      where: {
        slug,
        ...(webSlug ? { web: { slug: webSlug } } : {}),
      },
      select: { listingId: true, webId: true },
    })

    if (!placement) {
      return new Response('Listing not found', { status: 404 })
    }

    const listingEdit = await prisma.listingEdit.findFirst({
      where: {
        listingId: placement.listingId,
        webId: placement.webId,
      },
    })

    if (!listingEdit) {
      return new Response('Listing edit not found', { status: 404 })
    }

    // Delete the listing edit
    await prisma.listingEdit.delete({
      where: {
        id: listingEdit.id,
      },
    })

    if (listingEdit.image) {
      await deleteImage(listingEdit.image)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('[RW] Error deleting listing edit:', error)
    Sentry.captureException(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
