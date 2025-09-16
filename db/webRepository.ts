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
