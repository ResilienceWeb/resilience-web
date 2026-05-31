import prisma from '@prisma-rw'

export const markListingEditAsAccepted = async (listingEditId: number) => {
  await prisma.listingEdit.update({
    where: {
      id: listingEditId,
    },
    data: {
      accepted: true,
    },
  })
}

export const getListingEdits = async (listingSlug: string, webSlug?: string) => {
  const placement = await prisma.listingPlacement.findFirst({
    where: {
      slug: listingSlug,
      web: {
        deletedAt: null,
        ...(webSlug ? { slug: { contains: webSlug } } : {}),
      },
    },
    select: { listingId: true, webId: true },
  })

  if (!placement) return []

  const listingEdits = await prisma.listingEdit.findMany({
    where: {
      accepted: false,
      listingId: placement.listingId,
      webId: placement.webId,
    },
    include: {
      socials: true,
      actions: true,
      tags: {
        select: {
          id: true,
          label: true,
        },
      },
      category: {
        select: {
          id: true,
          color: true,
          label: true,
        },
      },
      user: true,
      location: true,
    },
  })

  return listingEdits
}

export const getListingEditStats = async () => {
  const [proposed, accepted] = await Promise.all([
    prisma.listingEdit.count({
      where: {
        web: { deletedAt: null },
      },
    }),
    prisma.listingEdit.count({
      where: {
        accepted: true,
        web: { deletedAt: null },
      },
    }),
  ])

  return { proposed, accepted }
}

export const getListingEditsByWeb = async (
  webSlug: string,
  includeAccepted = false,
) => {
  const listingEdits = await prisma.listingEdit.findMany({
    where: {
      accepted: includeAccepted ? undefined : false,
      web: {
        slug: webSlug,
        deletedAt: null,
      },
    },
    include: {
      socials: true,
      actions: true,
      category: {
        select: {
          id: true,
          color: true,
          label: true,
        },
      },
      user: true,
      location: true,
      listing: {
        select: {
          id: true,
          title: true,
          placements: {
            where: { web: { slug: webSlug } },
            select: { slug: true },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return listingEdits.map((edit) => ({
    ...edit,
    listing: {
      id: edit.listing.id,
      title: edit.listing.title,
      slug: edit.listing.placements[0]?.slug ?? null,
    },
  }))
}
