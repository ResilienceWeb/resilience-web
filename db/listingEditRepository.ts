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
        ...(webSlug
          ? {
              web: {
                slug: {
                  contains: webSlug,
                },
              },
            }
          : {}),
      },
    },
    include: {
      socials: true,
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
