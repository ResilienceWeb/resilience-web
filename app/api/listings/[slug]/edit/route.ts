import type { NextRequest } from 'next/server'
import { Prisma } from '@prisma-client'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { auth } from '@auth'
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
    const session = await auth.api.getSession({
      headers: request.headers,
    })
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
    return new Response(`Unable to get listing edits - ${e}`, {
      status: 500,
    })
  }
}

export async function POST(request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    if (!session?.user) {
      return new Response('Not authorized', { status: 401 })
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
    const latitude = formData.get('latitude')
    const longitude = formData.get('longitude')
    const locationDescription = formData.get('locationDescription')
    const noPhysicalLocation = stringToBoolean(
      formData.get('noPhysicalLocation'),
    )

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
      slug: currentListing.slug,
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
        listing: {
          include: {
            web: {
              include: {
                webAccess: true,
              },
            },
          },
        },
      },
    })

    const web = listingEdit.listing.web

    const ownerAndEditorEmails = web.webAccess.map((access) => access.email)

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
    return new Response(`Unable to create listing edit - ${e}`, {
      status: 500,
    })
  }
}

export async function DELETE(request, props) {
  const params = await props.params
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })
    if (!session) {
      return new Response('Not authorized', { status: 401 })
    }

    const slug = params.slug
    const searchParams = request.nextUrl.searchParams
    const webSlug = searchParams.get('web')

    // Find the listing edit to delete
    const listingEdit = await prisma.listingEdit.findFirst({
      where: {
        listing: {
          slug,
          ...(webSlug
            ? {
                web: {
                  slug: webSlug,
                },
              }
            : {}),
        },
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
