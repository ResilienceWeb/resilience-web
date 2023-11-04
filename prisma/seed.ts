import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categoriesCambridge = [
  {
    label: 'Environment',
    color: '7ed957',
  },
  {
    label: 'Housing',
    color: 'cb6ce6',
  },
  {
    label: 'Social business',
    color: '778ffc',
  },
  {
    label: 'Transportation',
    color: '737373',
  },
  {
    label: 'Community',
    color: 'ff66c4',
  },
  {
    label: 'Animal rights',
    color: '008037',
  },
  {
    label: 'Social justice',
    color: 'ff5757',
  },
]

const categoriesUni = [
  {
    label: 'Policy',
    color: '000000',
  },
  {
    label: 'Infrastructure',
    color: 'ff5757',
  },
]

const listingsCambridge = [
  {
    title: 'Cambridge Community Kitchen',
    slug: 'cambridge-community-kitchen',
    description:
      'We are a food solidarity collective tackling food poverty in Cambridge by offering free, hot, plant-based meals to those who need them every Tuesday, Thursday and Sunday.',
  },
]

const listingsDurham = [
  {
    title: 'Conservation Research Institute',
    slug: 'conservation-research-institute',
  },
]

async function main() {
  const newWebCambridge = await prisma.location.create({
    data: {
      title: 'Cambridge',
      slug: 'cambridge',
      published: true,
      image:
        'https://resilienceweb.ams3.digitaloceanspaces.com/d395de3529d0bb86b05ee6501.jpg',
    },
  })

  for (const category of categoriesCambridge) {
    await prisma.category.create({
      data: {
        ...category,
        webId: newWebCambridge.id,
      },
    })
  }

  const newWebDurham = await prisma.location.create({
    data: {
      title: 'Durham',
      slug: 'durham',
      published: true,
      image:
        'https://resilienceweb.ams3.digitaloceanspaces.com/f0b36873107d6cef9da5f2400.webp',
    },
  })

  for (const category of categoriesUni) {
    await prisma.category.create({
      data: {
        ...category,
        webId: newWebDurham.id,
      },
    })
  }

  for (const listing of listingsCambridge) {
    const newCategory = await prisma.category.findFirst({
      where: {
        webId: newWebCambridge.id,
      },
    })

    await prisma.listing.create({
      data: {
        ...listing,
        webId: newWebCambridge.id,
        categoryId: newCategory.id,
      },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setTimeout(async () => {
    for (const listing of listingsDurham) {
      const newCategory = await prisma.category.findFirst({
        where: {
          webId: newWebDurham.id,
        },
      })

      await prisma.listing.create({
        data: {
          ...listing,
          webId: newWebDurham.id,
          categoryId: newCategory.id,
        },
      })
    }
  }, 1000)

  const userCambridgeOwner = await prisma.user.create({
    data: {
      email: 'ismail.diner+cambridge-owner@gmail.com',
    },
  })

  await prisma.ownership.create({
    data: {
      email: userCambridgeOwner.email,
      webs: {
        connect: [{ id: newWebCambridge.id }],
      },
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
