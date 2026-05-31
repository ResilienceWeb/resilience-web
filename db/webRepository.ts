import prisma from '@prisma-rw'

export const getWebById = async (webId: number) => {
  return await prisma.web.findFirst({
    where: {
      id: webId,
      deletedAt: null,
    },
    include: {
      webAccess: {
        select: {
          email: true,
        },
      },
      _count: {
        select: {
          listings: true,
        },
      },
    },
  })
}

export const getWebBySlug = async (slug: string) => {
  return await prisma.web.findFirst({
    where: {
      slug,
      deletedAt: null,
    },
  })
}

export const getAllWebs = async () => {
  return await prisma.web.findMany({
    where: {
      deletedAt: null,
    },
  })
}

export const softDeleteWebBySlug = async (slug: string) => {
  return await prisma.web.update({
    where: { slug },
    data: { deletedAt: new Date() },
  })
}

/** Hard delete. Currently not used in favour of soft delete. Will be implemented as a background job. */
export const deleteWebBySlug = async (slug: string) => {
  const web = await prisma.web.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!web) {
    throw new Error('Web not found')
  }

  // Drop listings whose only placement was in this web; the others survive via cascade
  // detach when we delete the web below.
  const orphanedListings = await prisma.listing.findMany({
    where: {
      placements: {
        every: { webId: web.id },
      },
    },
    select: { id: true },
  })
  if (orphanedListings.length > 0) {
    await prisma.listing.deleteMany({
      where: { id: { in: orphanedListings.map((l) => l.id) } },
    })
  }

  await prisma.category.deleteMany({
    where: {
      webId: web.id,
    },
  })

  return await prisma.web.delete({
    where: {
      slug,
    },
  })
}
