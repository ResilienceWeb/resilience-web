import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const locationCity = {
  title: 'Cambridge City',
  slug: 'cambridge-city',
}
const locationUni = {
  title: 'University of Cambridge',
  slug: 'cambridge-university',
}

const categoriesCity = [
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
    label: 'Connectivity',
    color: '5ce1e6',
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

const listingsCity = [
  {
    title: 'Cambridge Community Kitchen',
    slug: 'cambridge-community-kitchen',
    description:
      'We are a food solidarity collective tackling food poverty in Cambridge by offering free, hot, plant-based meals to those who need them every Tuesday, Thursday and Sunday.',
  },
]

const listingsUni = [
  {
    title: 'Conservation Research Institute',
    slug: 'conservation-research-institute',
  },
]

async function main() {
  const newLocationCity = await prisma.location.create({
    data: locationCity,
  })

  for (const category of categoriesCity) {
    await prisma.category.create({
      data: {
        ...category,
        webId: newLocationCity.id,
      },
    })
  }

  const newLocationUni = await prisma.location.create({
    data: locationUni,
  })
  for (const category of categoriesUni) {
    await prisma.category.create({
      data: {
        ...category,
        webId: newLocationUni.id,
      },
    })
  }

  for (const listing of listingsCity) {
    const newCategory = await prisma.category.findFirst({
      where: {
        webId: newLocationCity.id,
      },
    })

    await prisma.listing.create({
      data: {
        ...listing,
        webId: newLocationCity.id,
        categoryId: newCategory.id,
      },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setTimeout(async () => {
    for (const listing of listingsUni) {
      const newCategory = await prisma.category.findFirst({
        where: {
          webId: newLocationUni.id,
        },
      })

      await prisma.listing.create({
        data: {
          ...listing,
          webId: newLocationUni.id,
          categoryId: newCategory.id,
        },
      })
    }
  }, 1000)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
