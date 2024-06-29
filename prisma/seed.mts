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
    website: 'https://cckitchen.uk',
  },
]

const listingsDurham = [
  {
    title: 'Conservation Research Institute',
    slug: 'conservation-research-institute',
    description: `<p>The institute fosters productive interdisciplinary dialogue, bringing together colleagues from various intellectual backgrounds and traditions. It conducts ambitious research that bridges natural sciences, technology, arts, humanities, and social sciences. Additionally, it plays a crucial role in the MPhil in Conservation Leadership program, a masters course at the University of Cambridge, and contributes to the broader University-wide sustainability education agenda.
      The University of Cambridge Conservation Research Institute are founding members of the Cambridge Conservation Initiative (CCI), a unique collaboration with ten leading biodiversity conservation organisations. Established in October 2013, (See article HERE) the Institute has expanded its role, supporting the University's presence, along with other CCI organisations in the David Attenborough Building, which was designed to enhance collaboration and the sharing of perspectives across organisational and disciplinary boundaries. As an Interdisciplinary Research Centre (IRC) since October 2016, it promotes collaboration and breaks down disciplinary silos by integrating conservation-related research from all six core University Schools.
      In the 21st century, understanding and managing human impacts on organisms and ecosystems amid population growth, socio-economic development, and climate change is a major challenge. Biodiversity faces threats from over-consumption, over-exploitation, and unsustainable use of natural resources. Addressing these challenges requires a better understanding of nature's value and practical steps for equitable and effective planet stewardship. All of which is our mission to address and help to foster positive change.`,
  },
]

async function populateSeedData() {
  const newWebCambridge = await prisma.web.create({
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

  const newWebDurham = await prisma.web.create({
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
      email:
        process.env.RW_TEST_USER_EMAIL ??
        'ismail.diner+cambridge-owner@gmail.com',
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

populateSeedData()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
