import { PrismaPg } from '@prisma/adapter-pg'
import { sameTagLabel } from '../helpers/tags.ts'
import { PrismaClient, WebRole } from './generated/client.ts'
import { sslFor } from './ssl.ts'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: sslFor(process.env.DATABASE_URL),
})
const prisma = new PrismaClient({ adapter })

// The Playwright specs in tests/ assert on these webs and listings by text, and
// match substrings: keep "Cambridge" and "Durham" out of other web titles, and
// the names of the Cambridge listings they check out of any other listing.

const DAY = 24 * 60 * 60 * 1000
const now = new Date()
const daysAgo = (days: number) => new Date(now.getTime() - days * DAY)
const daysFromNow = (days: number) => new Date(now.getTime() + days * DAY)

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200`

const TEST_USER_EMAIL =
  process.env.RW_TEST_USER_EMAIL ?? 'ismail.diner+cambridge-owner@gmail.com'

interface SeedCategory {
  label: string
  color?: string
  icon?: string
}

interface SeedListing {
  title: string
  slug: string
  description?: string
  website?: string
  email?: string
  notes?: string
  image?: string
  // Omitted for a placement that has been shared into a web but not yet
  // categorised there, which keeps it off the public page.
  categoryLabel?: string
  location?:
    { latitude: number; longitude: number; description: string } | 'online'
  tags?: string[]
  socials?: { platform: string; url: string }[]
  actions?: { type: string; url: string }[]
  seekingVolunteers?: boolean
  inactive?: boolean
  pending?: boolean
  proposerEmail?: string
  // Featured until this date; a past date is a feature that has lapsed.
  featured?: Date
  createdAt?: Date
  // Further webs this listing is placed in, beyond the one it's seeded under.
  alsoIn?: { webSlug: string; slug: string; categoryLabel?: string }[]
}

interface SeedWeb {
  title: string
  slug: string
  description: string
  contactEmail?: string
  image?: string
  published: boolean
  createdAt: Date
  deletedAt?: Date
  location?: { latitude: number; longitude: number; description: string }
  features: Partial<
    Record<'show-map' | 'show-analytics' | 'share-listings', boolean>
  >
  categories: SeedCategory[]
  tags: string[]
  listings: SeedListing[]
}

const users = {
  admin: TEST_USER_EMAIL,
  cambridgeEditor: 'editor@example.com',
  invited: 'invited@example.com',
  durhamOwner: 'durham-owner@example.com',
  bristolOwner: 'bristol-owner@example.com',
  member: 'member@example.com',
  banned: 'banned@example.com',
}

const webs: SeedWeb[] = [
  {
    title: 'Cambridge',
    slug: 'cambridge',
    description:
      'Groups and organisations working for a fairer, greener Cambridge — from food and housing to transport and nature.',
    contactEmail: 'hello@cambridge.example.org',
    image:
      'https://kdfprvggsvdbybtdpojv.supabase.co/storage/v1/object/public/resilienceweb-images/d395de3529d0bb86b05ee6503.jpg',
    published: true,
    // Older than two months, so listings added in the last month show as new.
    createdAt: daysAgo(400),
    location: {
      latitude: 52.205337,
      longitude: 0.121817,
      description: 'Cambridge, UK',
    },
    features: {
      'show-map': true,
      'show-analytics': true,
      'share-listings': true,
    },
    categories: [
      { label: 'Environment', color: '7ed957', icon: 'Leaf' },
      { label: 'Housing', color: 'cb6ce6', icon: 'Home' },
      { label: 'Social business', color: '778ffc', icon: 'HandsHelping' },
      { label: 'Transportation', color: '737373', icon: 'Bus' },
      { label: 'Community', color: 'ff66c4', icon: 'City' },
      { label: 'Animal rights', color: '008037', icon: 'Paw' },
      { label: 'Social justice', color: 'ff5757', icon: 'BalanceScale' },
    ],
    tags: [
      'Free',
      'Family friendly',
      'Volunteer-run',
      'Wheelchair accessible',
      'Online',
    ],
    listings: [
      {
        title: 'Cambridge Community Kitchen',
        slug: 'cambridge-community-kitchen',
        description:
          'We are a food solidarity collective tackling food poverty in Cambridge by offering free, hot, plant-based meals to those who need them every Tuesday, Thursday and Sunday.',
        website: 'https://cckitchen.uk',
        email: 'hello@cckitchen.example.org',
        image: unsplash('1530174883092-c2a7aa3f1cfe'),
        categoryLabel: 'Community',
        location: {
          latitude: 52.201257,
          longitude: 0.131836,
          description: 'Arbury Community Centre, Cambridge',
        },
        tags: ['Free', 'Volunteer-run'],
        socials: [
          { platform: 'instagram', url: 'https://instagram.com/cckitchen' },
          { platform: 'facebook', url: 'https://facebook.com/cckitchen' },
        ],
        actions: [
          { type: 'volunteer', url: 'https://cckitchen.uk/volunteer' },
          { type: 'donate', url: 'https://cckitchen.uk/donate' },
        ],
        seekingVolunteers: true,
        createdAt: daysAgo(380),
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
        tags: ['Wheelchair accessible'],
        socials: [
          {
            platform: 'bluesky',
            url: 'https://bsky.app/profile/ccf.bsky.social',
          },
          { platform: 'mastodon', url: 'https://mastodon.social/@ccf' },
        ],
        actions: [
          {
            type: 'newsletter',
            url: 'https://cambridgecarbonfootprint.org/newsletter',
          },
        ],
        createdAt: daysAgo(370),
      },
      {
        title: 'Cambridge Sustainable Food',
        slug: 'cambridge-sustainable-food',
        description:
          'Cambridge Sustainable Food (CSF) is a not-for-profit organization working towards a fair and sustainable food system for Cambridge. Our vision is of a vibrant local food system that is healthy, resilient and fair.',
        website: 'https://cambridgesustainablefood.org',
        image: unsplash('1550989460-0adf9ea622e2'),
        categoryLabel: 'Environment',
        location: {
          latitude: 52.199813,
          longitude: 0.124178,
          description: 'The Guildhall, Market Square, Cambridge',
        },
        tags: ['Family friendly'],
        actions: [
          {
            type: 'resources',
            url: 'https://cambridgesustainablefood.org/resources',
          },
        ],
        featured: daysFromNow(14),
        createdAt: daysAgo(360),
      },
      {
        title: 'Cambridge Cycling Campaign',
        slug: 'cambridge-cycling-campaign',
        description:
          'Cambridge Cycling Campaign (Camcycle) is a charity that works for more, better and safer cycling, for all ages and abilities, in and around Cambridge.',
        website: 'https://www.camcycle.org.uk',
        image: unsplash('1485965120184-e220f721d03e'),
        categoryLabel: 'Transportation',
        location: {
          latitude: 52.207123,
          longitude: 0.131803,
          description: 'Llandaff Chambers, 2 Regent Street, Cambridge',
        },
        socials: [
          { platform: 'twitter', url: 'https://twitter.com/camcycle' },
          { platform: 'youtube', url: 'https://youtube.com/@camcycle' },
        ],
        actions: [
          { type: 'newsletter', url: 'https://www.camcycle.org.uk/newsletter' },
          { type: 'contact', url: 'https://www.camcycle.org.uk/contact' },
        ],
        createdAt: daysAgo(350),
      },
      {
        title: 'Cambridge Cohousing',
        slug: 'cambridge-cohousing',
        description:
          'Cambridge Cohousing is a community-led housing development that combines the autonomy of private dwellings with the advantages of community living. We aim to create affordable, sustainable housing with shared resources and strong community bonds.',
        website: 'https://cambridgecohousing.org.uk',
        notes: 'Internal note: waiting list reopens in spring.',
        categoryLabel: 'Housing',
        location: {
          latitude: 52.232102,
          longitude: 0.153275,
          description: 'K1 Cohousing, Orchard Park, Cambridge',
        },
        createdAt: daysAgo(340),
      },
      {
        title: 'Cambridge Repair Cafe',
        slug: 'cambridge-repair-cafe',
        description:
          'Cambridge Repair Cafe is a free community event where volunteers help fix broken household items, reducing waste and building community skills. We fix items like small appliances, bicycles, clothing, and electronics.',
        website: 'https://circularcambridge.org/repair-cafes',
        image: unsplash('1581092918056-0c4c3acd3789'),
        categoryLabel: 'Community',
        location: {
          latitude: 52.200742,
          longitude: 0.128491,
          description: 'Cambridge Central Library, 7 Lion Yard, Cambridge',
        },
        tags: ['Free', 'Family friendly', 'Volunteer-run'],
        seekingVolunteers: true,
        createdAt: daysAgo(300),
      },
      {
        title: 'Cambridge Dog Rescue',
        slug: 'cambridge-dog-rescue',
        description:
          'Cambridge Dog Rescue is a volunteer-run charity dedicated to finding loving forever homes for dogs in need. We rescue, rehabilitate, and rehome dogs across the Cambridgeshire area.',
        website: 'https://cambridgedogrescue.org',
        image: unsplash('1561037404-61cd46aa615b'),
        categoryLabel: 'Animal rights',
        location: {
          latitude: 52.212631,
          longitude: 0.11685,
          description: 'Milton Country Park, Cambridge Road, Milton, Cambridge',
        },
        actions: [
          { type: 'donate', url: 'https://cambridgedogrescue.org/donate' },
        ],
        featured: daysAgo(3),
        createdAt: daysAgo(250),
      },
      {
        title: 'Cambridge Social Ventures',
        slug: 'cambridge-social-ventures',
        description:
          'Cambridge Social Ventures supports businesses that aim to create positive social and environmental impact alongside financial sustainability. We provide training, mentoring, and networking opportunities for social entrepreneurs.',
        website:
          'https://www.jbs.cam.ac.uk/faculty-research/centres/social-innovation/cambridge-social-ventures',
        image: unsplash('1526948531399-320e7e40f0ca'),
        categoryLabel: 'Social business',
        location: {
          latitude: 52.206438,
          longitude: 0.114525,
          description:
            'Cambridge Judge Business School, Trumpington Street, Cambridge',
        },
        socials: [
          {
            platform: 'linkedin',
            url: 'https://linkedin.com/company/cambridge-social-ventures',
          },
        ],
        actions: [
          {
            type: 'corporate-volunteering',
            url: 'https://www.jbs.cam.ac.uk/csv/volunteering',
          },
        ],
        createdAt: daysAgo(200),
      },
      {
        title: 'Mill Road Mutual Aid',
        slug: 'mill-road-mutual-aid',
        description:
          '<p>Neighbours helping neighbours along Mill Road: <strong>shopping runs</strong>, prescription pick-ups and a weekly check-in call.</p><ul><li>Request help any time</li><li>Offer an hour a week</li></ul>',
        email: 'millroad@example.org',
        categoryLabel: 'Social justice',
        location: {
          latitude: 52.198541,
          longitude: 0.139512,
          description: 'Ross Street Community Centre, Cambridge',
        },
        tags: ['Volunteer-run'],
        actions: [{ type: 'volunteer', url: 'https://example.org/mill-road' }],
        seekingVolunteers: true,
        createdAt: daysAgo(5),
      },
      {
        title: 'Fen Edge Climate Helpline',
        slug: 'fen-edge-climate-helpline',
        description:
          'A free phone and video line for anyone feeling anxious about the climate crisis, run by trained volunteers.',
        website: 'https://example.org/climate-helpline',
        categoryLabel: 'Social justice',
        location: 'online',
        tags: ['Free', 'Online'],
        createdAt: daysAgo(12),
      },
      {
        title: 'Open Doors Housing Co-op',
        slug: 'open-doors-housing-co-op',
        categoryLabel: 'Housing',
        createdAt: daysAgo(150),
      },
      {
        title: 'Grafton Swap Shop',
        slug: 'grafton-swap-shop',
        description:
          'A clothes and homeware swap that closed in 2025. Kept as an inactive listing.',
        categoryLabel: 'Community',
        inactive: true,
        createdAt: daysAgo(320),
      },
      {
        title: 'Arbury Seed Library',
        slug: 'arbury-seed-library',
        description:
          'Borrow seeds in spring, return some of the harvest in autumn. Proposed by a visitor and awaiting approval.',
        website: 'https://example.org/seed-library',
        categoryLabel: 'Environment',
        pending: true,
        proposerEmail: users.member,
        createdAt: daysAgo(2),
      },
      {
        title: 'Community Energy Network',
        slug: 'community-energy-network',
        description:
          'Supports local groups setting up community-owned solar and wind schemes, and shares what works between towns.',
        website: 'https://example.org/community-energy',
        image: unsplash('1509391366360-2e959784a276'),
        categoryLabel: 'Social business',
        location: 'online',
        socials: [
          {
            platform: 'linkedin',
            url: 'https://linkedin.com/company/community-energy-network',
          },
        ],
        actions: [
          {
            type: 'newsletter',
            url: 'https://example.org/community-energy/newsletter',
          },
        ],
        createdAt: daysAgo(180),
        alsoIn: [
          {
            webSlug: 'bristol',
            slug: 'community-energy',
            categoryLabel: 'Energy',
          },
          {
            webSlug: 'durham',
            slug: 'community-energy-network',
            categoryLabel: 'Infrastructure',
          },
          // Shared into the draft web but not yet given a category there.
          { webSlug: 'brighton', slug: 'community-energy-network' },
          // In a deleted web, which must not appear under "also listed in".
          {
            webSlug: 'leeds',
            slug: 'community-energy-network',
            categoryLabel: 'Community',
          },
        ],
      },
    ],
  },
  {
    title: 'Durham',
    slug: 'durham',
    description: 'A new web mapping community action across County Durham.',
    contactEmail: 'durham@example.org',
    image:
      'https://kdfprvggsvdbybtdpojv.supabase.co/storage/v1/object/public/resilienceweb-images/f0b36873107d6cef9da5f2400.webp',
    published: true,
    // Under two months old, so nothing here is badged as new.
    createdAt: daysAgo(30),
    location: {
      latitude: 54.775326,
      longitude: -1.584852,
      description: 'Durham, UK',
    },
    features: { 'show-map': true },
    categories: [
      { label: 'Policy', color: '000000', icon: 'BalanceScale' },
      { label: 'Infrastructure', color: 'ff5757', icon: 'Tools' },
      { label: 'Food', color: 'f4a261', icon: 'Apple' },
    ],
    tags: ['Free'],
    listings: [
      {
        title: 'Conservation Research Institute',
        slug: 'conservation-research-institute',
        description: `<p>The institute fosters productive interdisciplinary dialogue, bringing together colleagues from various intellectual backgrounds and traditions. It conducts ambitious research that bridges natural sciences, technology, arts, humanities, and social sciences. Additionally, it plays a crucial role in the MPhil in Conservation Leadership program, a masters course at the University of Cambridge, and contributes to the broader University-wide sustainability education agenda.
      The University of Cambridge Conservation Research Institute are founding members of the Cambridge Conservation Initiative (CCI), a unique collaboration with ten leading biodiversity conservation organisations. Established in October 2013, (See article HERE) the Institute has expanded its role, supporting the University's presence, along with other CCI organisations in the David Attenborough Building, which was designed to enhance collaboration and the sharing of perspectives across organisational and disciplinary boundaries. As an Interdisciplinary Research Centre (IRC) since October 2016, it promotes collaboration and breaks down disciplinary silos by integrating conservation-related research from all six core University Schools.
      In the 21st century, understanding and managing human impacts on organisms and ecosystems amid population growth, socio-economic development, and climate change is a major challenge. Biodiversity faces threats from over-consumption, over-exploitation, and unsustainable use of natural resources. Addressing these challenges requires a better understanding of nature's value and practical steps for equitable and effective planet stewardship. All of which is our mission to address and help to foster positive change.</p>`,
        website: 'https://www.conservation.cam.ac.uk',
        image: unsplash('1550989460-0adf9ea622e2'),
        categoryLabel: 'Policy',
        createdAt: daysAgo(28),
      },
      {
        title: 'Durham Community Kitchen',
        slug: 'durham-community-kitchen',
        description:
          'We are a food solidarity collective tackling food poverty in Durham by offering free, hot, plant-based meals to those who need them every Tuesday, Thursday and Sunday.',
        website: 'https://dckitchen.uk',
        image: unsplash('1517248135467-4c7edcad34c4'),
        categoryLabel: 'Infrastructure',
        location: {
          latitude: 54.776943,
          longitude: -1.575529,
          description: 'Claypath, Durham',
        },
        tags: ['Free'],
        createdAt: daysAgo(27),
      },
      {
        title: 'Wear Valley Food Bank',
        slug: 'wear-valley-food-bank',
        description:
          'Emergency food parcels and signposting to debt and benefits advice across the Wear Valley.',
        website: 'https://example.org/wear-valley-food-bank',
        categoryLabel: 'Food',
        location: {
          latitude: 54.664318,
          longitude: -1.676549,
          description: 'Bishop Auckland Town Hall',
        },
        actions: [
          { type: 'donate', url: 'https://example.org/wear-valley/donate' },
          {
            type: 'volunteer',
            url: 'https://example.org/wear-valley/volunteer',
          },
        ],
        seekingVolunteers: true,
        createdAt: daysAgo(6),
      },
    ],
  },
  {
    title: 'Bristol',
    slug: 'bristol',
    description:
      'Co-operatives, food projects and arts groups building a more resilient Bristol.',
    contactEmail: 'bristol@example.org',
    published: true,
    createdAt: daysAgo(200),
    location: {
      latitude: 51.454514,
      longitude: -2.58791,
      description: 'Bristol, UK',
    },
    // The map is switched off here, to see the page without it.
    features: { 'show-map': false, 'share-listings': true },
    categories: [
      { label: 'Food', color: 'f4a261', icon: 'Carrot' },
      { label: 'Energy', color: 'e9c46a', icon: 'SolarPanel' },
      { label: 'Arts', color: '9b5de5', icon: 'Palette' },
      // Left on the schema defaults for colour and icon.
      { label: 'General' },
    ],
    tags: ['Co-operative', 'Free'],
    listings: [
      {
        title: 'Bristol Energy Cooperative',
        slug: 'bristol-energy-cooperative',
        description:
          'Community-owned solar roofs and ground arrays, with profits going to a local community fund.',
        website: 'https://example.org/bristol-energy',
        image: unsplash('1508514177221-188b1cf16e9d'),
        categoryLabel: 'Energy',
        location: {
          latitude: 51.459786,
          longitude: -2.564583,
          description: 'Easton, Bristol',
        },
        tags: ['Co-operative'],
        createdAt: daysAgo(190),
      },
      {
        title: 'Bristol Food Network',
        slug: 'bristol-food-network',
        description:
          'Connecting growers, cooks and eaters to make Bristol a sustainable food city.',
        website: 'https://example.org/bristol-food',
        categoryLabel: 'Food',
        location: {
          latitude: 51.45523,
          longitude: -2.59665,
          description: 'Harbourside, Bristol',
        },
        tags: ['Free'],
        createdAt: daysAgo(10),
      },
      {
        title: 'Knowle West Media Centre',
        slug: 'knowle-west-media-centre',
        description:
          'Arts and technology projects led by and for the Knowle West community.',
        website: 'https://example.org/kwmc',
        categoryLabel: 'Arts',
        location: {
          latitude: 51.42273,
          longitude: -2.58835,
          description: 'Knowle West, Bristol',
        },
        createdAt: daysAgo(170),
      },
      {
        title: 'Easton Community Garden',
        slug: 'easton-community-garden',
        description: 'A shared garden open to everyone on Saturday mornings.',
        categoryLabel: 'General',
        createdAt: daysAgo(160),
      },
    ],
  },
  {
    title: 'Brighton',
    slug: 'brighton',
    description: 'A web still being put together, not yet published.',
    published: false,
    createdAt: daysAgo(20),
    location: {
      latitude: 50.822529,
      longitude: -0.137163,
      description: 'Brighton, UK',
    },
    features: { 'show-map': true },
    categories: [{ label: 'Environment', color: '2a9d8f', icon: 'Seedling' }],
    tags: [],
    listings: [
      {
        title: 'Brighton Permaculture Trust',
        slug: 'brighton-permaculture-trust',
        description: 'Courses and community orchards across Sussex.',
        website: 'https://example.org/brighton-permaculture',
        categoryLabel: 'Environment',
        createdAt: daysAgo(18),
      },
    ],
  },
  {
    title: 'Leeds',
    slug: 'leeds',
    description: 'A web that was deleted, kept to check it stays hidden.',
    published: true,
    createdAt: daysAgo(500),
    deletedAt: daysAgo(10),
    features: { 'show-map': true },
    categories: [{ label: 'Community', color: 'e76f51', icon: 'Tools' }],
    tags: [],
    listings: [
      {
        title: 'Leeds Tool Library',
        slug: 'leeds-tool-library',
        description: 'Borrow drills, ladders and garden tools for a small fee.',
        categoryLabel: 'Community',
        createdAt: daysAgo(480),
      },
    ],
  },
]

// Related webs are stored one way round, from the web that chose them.
const webRelations: Record<string, string[]> = {
  cambridge: ['durham', 'bristol', 'brighton'],
  bristol: ['cambridge'],
}

// Pairs of related listings, by slug within the web they were seeded under.
const listingRelations: [string, string][] = [
  ['cambridge-community-kitchen', 'cambridge-sustainable-food'],
  ['cambridge-cycling-campaign', 'cambridge-carbon-footprint'],
  ['mill-road-mutual-aid', 'fen-edge-climate-helpline'],
  ['community-energy-network', 'cambridge-carbon-footprint'],
]

const webAccess: { email: string; webSlug: string; role: WebRole }[] = [
  // The admin's own webs decide which one /admin opens on: the first by title.
  // Keep Cambridge first, as tests/admin.authed.spec.ts expects it.
  { email: users.admin, webSlug: 'cambridge', role: WebRole.OWNER },
  { email: users.admin, webSlug: 'durham', role: WebRole.EDITOR },
  { email: users.cambridgeEditor, webSlug: 'cambridge', role: WebRole.EDITOR },
  { email: users.invited, webSlug: 'cambridge', role: WebRole.EDITOR },
  { email: users.durhamOwner, webSlug: 'durham', role: WebRole.OWNER },
  { email: users.durhamOwner, webSlug: 'brighton', role: WebRole.OWNER },
  { email: users.durhamOwner, webSlug: 'leeds', role: WebRole.OWNER },
  { email: users.bristolOwner, webSlug: 'bristol', role: WebRole.OWNER },
  { email: users.bristolOwner, webSlug: 'cambridge', role: WebRole.EDITOR },
]

async function seedUsers() {
  await prisma.user.createMany({
    data: [
      {
        email: users.admin,
        name: 'Cambridge Owner',
        role: 'admin',
        createdAt: daysAgo(400),
      },
      {
        email: users.cambridgeEditor,
        name: 'Erin Editor',
        createdAt: daysAgo(200),
      },
      // Invited to a web but never signed in, so shown as "Invite pending".
      { email: users.invited, emailVerified: false, createdAt: daysAgo(3) },
      {
        email: users.durhamOwner,
        name: 'Dana Durham',
        createdAt: daysAgo(30),
      },
      {
        email: users.bristolOwner,
        name: 'Bo Bristol',
        createdAt: daysAgo(200),
      },
      // No web access: proposes listings and edits as a member of the public.
      { email: users.member, name: 'Morgan Member', createdAt: daysAgo(60) },
      {
        email: users.banned,
        name: 'Sam Spammer',
        banned: true,
        banReason: 'Posting spam listings',
        banExpires: daysFromNow(30),
        createdAt: daysAgo(90),
      },
    ],
  })

  const all = await prisma.user.findMany({ select: { id: true, email: true } })
  return new Map(all.map((user) => [user.email, user.id]))
}

async function seedWeb(web: SeedWeb) {
  // The shared tags come from the migrations; a seed tag with a shared tag's
  // name adds it to the web rather than making a web tag that duplicates it.
  const sharedTags = await prisma.tag.findMany({ where: { webId: null } })
  const sharedTagFor = (label: string) =>
    sharedTags.find((t) => sameTagLabel(t.label, label))

  const created = await prisma.web.create({
    data: {
      title: web.title,
      slug: web.slug,
      description: web.description,
      contactEmail: web.contactEmail,
      image: web.image,
      published: web.published,
      publishedAt: web.published ? web.createdAt : null,
      createdAt: web.createdAt,
      deletedAt: web.deletedAt,
      location: web.location ? { create: web.location } : undefined,
      features: {
        create: Object.entries(web.features).map(([feature, enabled]) => ({
          feature,
          enabled,
        })),
      },
      categories: { create: web.categories },
      tags: {
        create: web.tags
          .filter((label) => !sharedTagFor(label))
          .map((label) => ({ label })),
      },
      sharedTags: {
        create: web.tags
          .map(sharedTagFor)
          .filter(Boolean)
          .map((tag) => ({ tagId: tag.id })),
      },
    },
    include: { categories: true, tags: true },
  })

  return {
    id: created.id,
    categoryIds: new Map(created.categories.map((c) => [c.label, c.id])),
    tagIds: new Map([
      ...web.tags.flatMap((label): [string, number][] => {
        const shared = sharedTagFor(label)
        return shared ? [[label, shared.id]] : []
      }),
      ...created.tags.map((t): [string, number] => [t.label, t.id]),
    ]),
  }
}

type SeededWeb = Awaited<ReturnType<typeof seedWeb>>

async function seedListing(
  listing: SeedListing,
  webSlug: string,
  seededWebs: Map<string, SeededWeb>,
  userIds: Map<string, string>,
) {
  const web = seededWebs.get(webSlug)

  const location =
    listing.location === 'online'
      ? { create: { noPhysicalLocation: true } }
      : listing.location
        ? { create: listing.location }
        : undefined

  const created = await prisma.listing.create({
    data: {
      title: listing.title,
      description: listing.description,
      website: listing.website,
      email: listing.email,
      notes: listing.notes,
      image: listing.image,
      seekingVolunteers: listing.seekingVolunteers,
      inactive: listing.inactive,
      pending: listing.pending,
      createdAt: listing.createdAt,
      proposer: listing.proposerEmail
        ? { connect: { id: userIds.get(listing.proposerEmail) } }
        : undefined,
      location,
      socials: listing.socials ? { create: listing.socials } : undefined,
      actions: listing.actions ? { create: listing.actions } : undefined,
      placements: {
        create: {
          webId: web.id,
          slug: listing.slug,
          categoryId: web.categoryIds.get(listing.categoryLabel),
          featured: listing.featured,
          createdAt: listing.createdAt,
          tags: listing.tags
            ? {
                connect: listing.tags.map((tag) => ({
                  id: web.tagIds.get(tag),
                })),
              }
            : undefined,
        },
      },
    },
  })

  for (const other of listing.alsoIn ?? []) {
    const otherWeb = seededWebs.get(other.webSlug)
    await prisma.listingPlacement.create({
      data: {
        listingId: created.id,
        webId: otherWeb.id,
        slug: other.slug,
        categoryId: other.categoryLabel
          ? otherWeb.categoryIds.get(other.categoryLabel)
          : undefined,
      },
    })
  }

  return created.id
}

async function seedListingEdits(
  listingIds: Map<string, number>,
  seededWebs: Map<string, SeededWeb>,
  userIds: Map<string, string>,
) {
  const cambridge = seededWebs.get('cambridge')

  const proposedLocation = await prisma.listingLocation.create({
    data: {
      latitude: 52.200742,
      longitude: 0.128491,
      description: 'Cambridge Central Library, 7 Lion Yard, Cambridge',
    },
  })

  // Awaiting review in /admin/listing-edits.
  await prisma.listingEdit.create({
    data: {
      listingId: listingIds.get('cambridge-repair-cafe'),
      webId: cambridge.id,
      userId: userIds.get(users.member),
      title: 'Cambridge Repair Cafe',
      slug: 'cambridge-repair-cafe',
      description:
        'Cambridge Repair Cafe is a free monthly event where volunteers help fix broken household items. Now also running a textiles table on the first Saturday of each month.',
      website: 'https://circularcambridge.org/repair-cafes',
      email: 'repair@example.org',
      categoryId: cambridge.categoryIds.get('Community'),
      locationId: proposedLocation.id,
      socials: {
        create: [
          {
            platform: 'instagram',
            url: 'https://instagram.com/repaircafecambridge',
          },
        ],
      },
      actions: {
        create: [
          { type: 'volunteer', url: 'https://circularcambridge.org/volunteer' },
        ],
      },
      createdAt: daysAgo(1),
    },
  })

  // Already approved, so it only shows in the listing's edit history.
  await prisma.listingEdit.create({
    data: {
      listingId: listingIds.get('cambridge-dog-rescue'),
      webId: cambridge.id,
      userId: userIds.get(users.cambridgeEditor),
      title: 'Cambridge Dog Rescue',
      slug: 'cambridge-dog-rescue',
      website: 'https://cambridgedogrescue.org',
      categoryId: cambridge.categoryIds.get('Animal rights'),
      accepted: true,
      createdAt: daysAgo(40),
    },
  })
}

async function seedNotifications(
  userIds: Map<string, string>,
  seededWebs: Map<string, SeededWeb>,
) {
  const createdById = userIds.get(users.admin)

  const welcome = await prisma.notification.create({
    data: {
      title: 'Welcome to the new admin dashboard',
      body: 'We have redesigned the dashboard to make reviewing edits quicker.',
      url: 'https://resilienceweb.org.uk/news',
      urlLabel: 'Read more',
      severity: 'info',
      audience: 'ALL',
      publishAt: daysAgo(7),
      createdById,
    },
  })

  await prisma.notification.createMany({
    data: [
      {
        title: 'Planned maintenance on Sunday',
        body: 'The site may be unavailable for up to an hour from 7am.',
        severity: 'warning',
        audience: 'ADMINS',
        publishAt: daysAgo(1),
        expiresAt: daysFromNow(5),
        createdById,
      },
      {
        title: 'Next month’s newsletter goes out soon',
        body: 'Feature a listing before the 1st to have it included.',
        severity: 'info',
        audience: 'ALL',
        publishAt: daysFromNow(3),
        createdById,
      },
      {
        title: 'Old announcement',
        body: 'This one has expired and should no longer show.',
        severity: 'info',
        audience: 'ALL',
        publishAt: daysAgo(60),
        expiresAt: daysAgo(30),
        createdById,
      },
    ],
  })

  await prisma.notification.create({
    data: {
      title: 'Cambridge listings need reviewing',
      body: 'Several listings have not been updated in over a year.',
      severity: 'critical',
      audience: 'WEB',
      publishAt: daysAgo(2),
      createdById,
      targetWebs: { create: { webId: seededWebs.get('cambridge').id } },
    },
  })

  await prisma.notificationReceipt.create({
    data: {
      notificationId: welcome.id,
      userId: createdById,
      seenAt: daysAgo(6),
      clickedAt: daysAgo(6),
    },
  })
}

// A seeded generator, so every reset produces the same charts.
function random(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
}

async function seedAnalytics(
  listingIds: Map<string, number>,
  seededWebs: Map<string, SeededWeb>,
) {
  const next = random(42)
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  const dates = Array.from(
    { length: 90 },
    (_, i) => new Date(today.getTime() - i * DAY),
  )

  const webRows = ['cambridge', 'durham', 'bristol'].flatMap((slug) =>
    dates.map((date) => ({
      webId: seededWebs.get(slug).id,
      date,
      eventType: 'view',
      count: Math.floor(next() * 120) + 10,
    })),
  )
  await prisma.webAnalyticsDaily.createMany({ data: webRows })

  const cambridgeId = seededWebs.get('cambridge').id
  const cambridgeListings = webs
    .find((web) => web.slug === 'cambridge')
    .listings.filter((listing) => !listing.pending && !listing.inactive)

  const listingRows = cambridgeListings.flatMap((listing) =>
    dates
      .filter((date) => date >= (listing.createdAt ?? daysAgo(90)))
      .flatMap((date) => [
        {
          listingId: listingIds.get(listing.slug),
          webId: cambridgeId,
          date,
          eventType: 'view',
          count: Math.floor(next() * 40) + 1,
        },
        ...(listing.actions ?? []).map((action) => ({
          listingId: listingIds.get(listing.slug),
          webId: cambridgeId,
          date,
          eventType: `action_${action.type.replaceAll('-', '_')}`,
          count: Math.floor(next() * 4),
        })),
      ]),
  )
  await prisma.listingAnalyticsDaily.createMany({ data: listingRows })
}

async function populateSeedData() {
  const userIds = await seedUsers()

  const seededWebs = new Map<string, SeededWeb>()
  for (const web of webs) {
    seededWebs.set(web.slug, await seedWeb(web))
  }

  for (const [from, to] of Object.entries(webRelations)) {
    await prisma.web.update({
      where: { slug: from },
      data: { relations: { connect: to.map((slug) => ({ slug })) } },
    })
  }

  const listingIds = new Map<string, number>()
  for (const web of webs) {
    for (const listing of web.listings) {
      listingIds.set(
        listing.slug,
        await seedListing(listing, web.slug, seededWebs, userIds),
      )
    }
  }

  for (const [from, to] of listingRelations) {
    await prisma.listing.update({
      where: { id: listingIds.get(from) },
      data: { relations: { connect: { id: listingIds.get(to) } } },
    })
  }

  await prisma.webAccess.createMany({
    data: webAccess.map(({ email, webSlug, role }) => ({
      email,
      role,
      webId: seededWebs.get(webSlug).id,
    })),
  })

  await seedListingEdits(listingIds, seededWebs, userIds)
  await seedNotifications(userIds, seededWebs)
  await seedAnalytics(listingIds, seededWebs)
}

populateSeedData()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
