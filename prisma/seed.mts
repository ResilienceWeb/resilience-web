import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client.ts'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})
const prisma = new PrismaClient({ adapter })

interface ListingLocation {
  latitude: number
  longitude: number
  description: string
}

interface CambridgeListing {
  title: string
  slug: string
  description: string
  website: string
  image?: string
  categoryLabel: string
  location?: ListingLocation
}

interface DurhamListing {
  title: string
  slug: string
  description: string
  website: string
  image?: string
  categoryLabel: string
  location?: ListingLocation
}

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

const categoriesDurham = [
  {
    label: 'Policy',
    color: '000000',
  },
  {
    label: 'Infrastructure',
    color: 'ff5757',
  },
]

const listingsCambridge: CambridgeListing[] = [
  {
    title: 'Cambridge Community Kitchen',
    slug: 'cambridge-community-kitchen',
    description:
      'We are a food solidarity collective tackling food poverty in Cambridge by offering free, hot, plant-based meals to those who need them every Tuesday, Thursday and Sunday.',
    website: 'https://cckitchen.uk',
    image:
      'https://images.unsplash.com/photo-1530174883092-c2a7aa3f1cfe?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    categoryLabel: 'Community',
    location: {
      latitude: 52.201257,
      longitude: 0.131836,
      description: 'Arbury Community Centre, Cambridge',
    },
  },
  {
    title: 'Cambridge Carbon Footprint',
    slug: 'cambridge-carbon-footprint',
    description:
      'Cambridge Carbon Footprint works to raise awareness of climate change issues and to support people in moving to low-carbon living. We engage with individuals and communities to help them understand their carbon footprints and take action to reduce them.',
    website: 'https://cambridgecarbonfootprint.org',
    categoryLabel: 'Environment',
    location: {
      latitude: 52.189323,
      longitude: 0.139163,
      description: 'The Bike Depot, 140 Cowley Road, Cambridge',
    },
  },
  {
    title: 'Cambridge Sustainable Food',
    slug: 'cambridge-sustainable-food',
    description:
      'Cambridge Sustainable Food (CSF) is a not-for-profit organization working towards a fair and sustainable food system for Cambridge. Our vision is of a vibrant local food system that is healthy, resilient and fair.',
    website: 'https://cambridgesustainablefood.org',
    image:
      'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    categoryLabel: 'Environment',
    location: {
      latitude: 52.199813,
      longitude: 0.124178,
      description: 'The Guildhall, Market Square, Cambridge',
    },
  },
  {
    title: 'Cambridge Cycling Campaign',
    slug: 'cambridge-cycling-campaign',
    description:
      'Cambridge Cycling Campaign (Camcycle) is a charity that works for more, better and safer cycling, for all ages and abilities, in and around Cambridge.',
    website: 'https://www.camcycle.org.uk',
    image:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    categoryLabel: 'Transportation',
    location: {
      latitude: 52.207123,
      longitude: 0.131803,
      description: 'Llandaff Chambers, 2 Regent Street, Cambridge',
    },
  },
  {
    title: 'Cambridge Cohousing',
    slug: 'cambridge-cohousing',
    description:
      'Cambridge Cohousing is a community-led housing development that combines the autonomy of private dwellings with the advantages of community living. We aim to create affordable, sustainable housing with shared resources and strong community bonds.',
    website: 'https://cambridgecohousing.org.uk',
    categoryLabel: 'Housing',
    location: {
      latitude: 52.232102,
      longitude: 0.153275,
      description: 'K1 Cohousing, Orchard Park, Cambridge',
    },
  },
  {
    title: 'Cambridge Repair Cafe',
    slug: 'cambridge-repair-cafe',
    description:
      'Cambridge Repair Cafe is a free community event where volunteers help fix broken household items, reducing waste and building community skills. We fix items like small appliances, bicycles, clothing, and electronics.',
    website: 'https://circularcambridge.org/repair-cafes',
    image:
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    categoryLabel: 'Community',
    location: {
      latitude: 52.200742,
      longitude: 0.128491,
      description: 'Cambridge Central Library, 7 Lion Yard, Cambridge',
    },
  },
  {
    title: 'Cambridge Dog Rescue',
    slug: 'cambridge-dog-rescue',
    description:
      'Cambridge Dog Rescue is a volunteer-run charity dedicated to finding loving forever homes for dogs in need. We rescue, rehabilitate, and rehome dogs across the Cambridgeshire area.',
    website: 'https://cambridgedogrescue.org',
    image:
      'https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    categoryLabel: 'Animal rights',
    location: {
      latitude: 52.212631,
      longitude: 0.11685,
      description: 'Milton Country Park, Cambridge Road, Milton, Cambridge',
    },
  },
  {
    title: 'Cambridge Social Ventures',
    slug: 'cambridge-social-ventures',
    description:
      'Cambridge Social Ventures supports businesses that aim to create positive social and environmental impact alongside financial sustainability. We provide training, mentoring, and networking opportunities for social entrepreneurs.',
    website:
      'https://www.jbs.cam.ac.uk/faculty-research/centres/social-innovation/cambridge-social-ventures',
    image:
      'https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    categoryLabel: 'Social business',
    location: {
      latitude: 52.206438,
      longitude: 0.114525,
      description:
        'Cambridge Judge Business School, Trumpington Street, Cambridge',
    },
  },
]

const listingsDurham: DurhamListing[] = [
  {
    title: 'Conservation Research Institute',
    slug: 'conservation-research-institute',
    description: `<p>The institute fosters productive interdisciplinary dialogue, bringing together colleagues from various intellectual backgrounds and traditions. It conducts ambitious research that bridges natural sciences, technology, arts, humanities, and social sciences. Additionally, it plays a crucial role in the MPhil in Conservation Leadership program, a masters course at the University of Cambridge, and contributes to the broader University-wide sustainability education agenda.
      The University of Cambridge Conservation Research Institute are founding members of the Cambridge Conservation Initiative (CCI), a unique collaboration with ten leading biodiversity conservation organisations. Established in October 2013, (See article HERE) the Institute has expanded its role, supporting the University's presence, along with other CCI organisations in the David Attenborough Building, which was designed to enhance collaboration and the sharing of perspectives across organisational and disciplinary boundaries. As an Interdisciplinary Research Centre (IRC) since October 2016, it promotes collaboration and breaks down disciplinary silos by integrating conservation-related research from all six core University Schools.
      In the 21st century, understanding and managing human impacts on organisms and ecosystems amid population growth, socio-economic development, and climate change is a major challenge. Biodiversity faces threats from over-consumption, over-exploitation, and unsustainable use of natural resources. Addressing these challenges requires a better understanding of nature's value and practical steps for equitable and effective planet stewardship. All of which is our mission to address and help to foster positive change.`,
    website: 'https://www.conservation.cam.ac.uk',
    image:
      'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    categoryLabel: 'Policy',
  },
  {
    title: 'Durham Community Kitchen',
    slug: 'durham-community-kitchen',
    description:
      'We are a food solidarity collective tackling food poverty in Cambridge by offering free, hot, plant-based meals to those who need them every Tuesday, Thursday and Sunday.',
    website: 'https://dckitchen.uk',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200',
    categoryLabel: 'Infrastructure',
  },
]

async function populateSeedData() {
  const newWebCambridge = await prisma.web.create({
    data: {
      title: 'Cambridge',
      slug: 'cambridge',
      published: true,
      image:
        'https://resilienceweb.ams3.digitaloceanspaces.com/d395de3529d0bb86b05ee6503.jpg',
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

  for (const category of categoriesDurham) {
    await prisma.category.create({
      data: {
        ...category,
        webId: newWebDurham.id,
      },
    })
  }

  for (const listing of listingsCambridge) {
    const category = await prisma.category.findFirst({
      where: {
        webId: newWebCambridge.id,
        label: listing.categoryLabel,
      },
    })

    // Create location first if available
    let locationId: number | undefined = undefined
    if (listing.location) {
      const location = await prisma.listingLocation.create({
        data: {
          latitude: listing.location.latitude,
          longitude: listing.location.longitude,
          description: listing.location.description,
        },
      })
      locationId = location.id
    }

    await prisma.listing.create({
      data: {
        title: listing.title,
        slug: listing.slug,
        description: listing.description,
        website: listing.website,
        image: listing.image,
        webId: newWebCambridge.id,
        categoryId: category.id,
        locationId: locationId,
      },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setTimeout(async () => {
    for (const listing of listingsDurham) {
      const category = await prisma.category.findFirst({
        where: {
          webId: newWebDurham.id,
          label: listing.categoryLabel,
        },
      })

      let locationId: number | undefined = undefined
      if (listing.location) {
        const location = await prisma.listingLocation.create({
          data: {
            latitude: listing.location.latitude,
            longitude: listing.location.longitude,
            description: listing.location.description,
          },
        })
        locationId = location.id
      }

      await prisma.listing.create({
        data: {
          title: listing.title,
          slug: listing.slug,
          description: listing.description,
          website: listing.website,
          image: listing.image,
          webId: newWebDurham.id,
          categoryId: category.id,
          locationId: locationId,
        },
      })
    }
  }, 1000)

  const userCambridgeOwner = await prisma.user.create({
    data: {
      role: 'admin',
      email:
        process.env.RW_TEST_USER_EMAIL ??
        'ismail.diner+cambridge-owner@gmail.com',
    },
  })

  await prisma.webAccess.create({
    data: {
      email: userCambridgeOwner.email,
      webId: newWebCambridge.id,
      role: 'OWNER',
    },
  })
}

populateSeedData()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
