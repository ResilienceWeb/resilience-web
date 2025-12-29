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

export const getListingEdits = async (listingSlug, webSlug) => {
  const listingEdits = await prisma.listingEdit.findMany({
    where: {
      accepted: false,
      listing: {
        slug: listingSlug,
        web: {
          ...(webSlug
            ? {
                slug: {
                  contains: webSlug,
                },
              }
            : {}),
          deletedAt: null,
        },
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
    },
  })

  return listingEdits
}

export const getListingEditsByWeb = async (
  webSlug: string,
  includeAccepted = false,
) => {
  const listingEdits = await prisma.listingEdit.findMany({
    where: {
      accepted: includeAccepted ? undefined : false,
      listing: {
        web: {
          slug: webSlug,
          deletedAt: null,
        },
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
          slug: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return listingEdits
}
