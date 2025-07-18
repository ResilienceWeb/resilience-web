import prisma from '@prisma-rw'

export const isOwnerOfWeb = async (userId: string, webId: number) => {
  const web = await prisma.web.findFirst({
    where: {
      ownerships: {
        some: {
          user: {
            id: {
              equals: userId,
            },
          },
          webs: {
            some: {
              id: {
                equals: webId,
              },
            },
          },
        },
      },
    },
  })

  return !!web
}

export const getWebById = async (webId: number) => {
  return await prisma.web.findUnique({
    where: {
      id: webId,
    },
  })
}
