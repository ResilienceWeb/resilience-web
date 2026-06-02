import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import prisma from '@prisma-rw'
import { auth } from '@auth'

/**
 * POST /api/listing/[id]/share
 * Superadmin-only. Adds an existing listing to another web by creating a new placement.
 * Body: { webId: number, slug: string, categoryId?: number }
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (session?.user?.role !== 'admin') {
      return new Response('Unauthorized', { status: 403 })
    }

    const listingId = Number(params.id)
    const { webId, slug, categoryId } = await request.json()

    if (!webId || !slug) {
      return Response.json(
        { error: 'webId and slug are required' },
        { status: 400 },
      )
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, title: true },
    })
    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 })
    }

    const web = await prisma.web.findUnique({
      where: { id: webId },
      select: { id: true, slug: true, title: true, deletedAt: true },
    })
    if (!web || web.deletedAt) {
      return Response.json({ error: 'Web not found' }, { status: 404 })
    }

    const existing = await prisma.listingPlacement.findUnique({
      where: { listingPlacementPair: { listingId, webId } },
      select: { id: true },
    })
    if (existing) {
      return Response.json(
        { error: 'Listing is already placed in this web' },
        { status: 409 },
      )
    }

    const slugClash = await prisma.listingPlacement.findUnique({
      where: { webSlug: { webId, slug } },
      select: { id: true },
    })
    if (slugClash) {
      return Response.json(
        { error: 'A listing with that slug already exists in this web' },
        { status: 409 },
      )
    }

    const placement = await prisma.listingPlacement.create({
      data: {
        listingId,
        webId,
        slug,
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        web: { select: { slug: true, title: true } },
      },
    })

    revalidatePath(`/${placement.web.slug}`)
    revalidatePath(`/${placement.web.slug}/${placement.slug}`)

    return Response.json({ placement })
  } catch (e) {
    console.error(`[RW] Unable to share listing - ${e}`)
    Sentry.captureException(e)
    return new Response(
      "We couldn't share this listing right now. Please try again in a moment.",
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/listing/[id]/share?webId=N
 * Superadmin-only. Removes a placement (detaches the listing from one web).
 * If it was the only placement, the listing itself remains alive — superadmin must
 * use the regular delete flow to remove the listing entirely.
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (session?.user?.role !== 'admin') {
      return new Response('Unauthorized', { status: 403 })
    }

    const listingId = Number(params.id)
    const webId = Number(request.nextUrl.searchParams.get('webId'))

    if (!webId) {
      return Response.json({ error: 'webId is required' }, { status: 400 })
    }

    const placement = await prisma.listingPlacement.findUnique({
      where: { listingPlacementPair: { listingId, webId } },
      include: { web: { select: { slug: true } } },
    })
    if (!placement) {
      return Response.json({ error: 'Placement not found' }, { status: 404 })
    }

    const totalPlacements = await prisma.listingPlacement.count({
      where: { listingId },
    })
    if (totalPlacements <= 1) {
      return Response.json(
        {
          error: 'Cannot detach the only placement; delete the listing instead',
        },
        { status: 400 },
      )
    }

    await prisma.listingPlacement.delete({
      where: { id: placement.id },
    })

    revalidatePath(`/${placement.web.slug}`)

    return Response.json({ ok: true })
  } catch (e) {
    console.error(`[RW] Unable to detach listing - ${e}`)
    Sentry.captureException(e)
    return new Response(
      "We couldn't remove this listing from that web right now. Please try again in a moment.",
      { status: 500 },
    )
  }
}
