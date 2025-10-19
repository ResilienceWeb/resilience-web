import prisma from '@prisma-rw'

export const getWebById = async (webId: number) => {
  return await prisma.web.findUnique({
    where: {
      id: webId,
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
  return await prisma.web.findUnique({
    where: {
      slug,
    },
  })
}

export const deleteWebBySlug = async (slug: string) => {
  const web = await prisma.web.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!web) {
    throw new Error('Web not found')
  }

  await prisma.listing.deleteMany({
    where: {
      webId: web.id,
    },
  })

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
