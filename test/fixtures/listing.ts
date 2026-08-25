/**
 * A listing in the shape the client sees it — what `/api/listings` returns and
 * what the admin screens and the edit form are given as props.
 *
 * Tests name only the fields they are about; everything else is a plausible
 * default, so a test reads as the one thing it is checking.
 */

export interface CategoryFixture {
  id: number
  label: string
  color: string
  icon: string
}

export interface ListingFixtureOverrides {
  id?: number
  title?: string
  slug?: string
  description?: string
  category?: Partial<CategoryFixture>
  email?: string
  website?: string
  image?: string | null
  socials?: { platform: string; url: string }[]
  actions?: { type: string; url: string }[]
  tags?: { id: number; label: string }[]
  location?: {
    latitude?: number
    longitude?: number
    description?: string
    noPhysicalLocation?: boolean
  } | null
  /** Set by the admin table's star; a date in the future means featured. */
  featured?: string | null
  /** True while a proposed listing is waiting for an editor to approve it. */
  pending?: boolean
  inactive?: boolean
  /** Suggested edits awaiting review. */
  edits?: unknown[]
  createdAt?: string
  updatedAt?: string
  sharedWith?: unknown[]
}

const DEFAULT_CATEGORY: CategoryFixture = {
  id: 4,
  label: 'Community',
  color: 'b0e3c1',
  icon: 'default',
}

/**
 * The `Listing` type describes the Prisma row, where dates are `Date` objects
 * and the relations carry every column. What the client actually receives is
 * JSON — dates as strings, relations trimmed to what the screen needs — which
 * is what this builds, so it is handed over as a `Listing` at the boundary.
 */
export function listing(overrides: ListingFixtureOverrides = {}): Listing {
  const title = overrides.title ?? 'Bike Kitchen'

  return {
    id: 1,
    title,
    slug: slugify(title),
    description: 'A workshop where volunteers help you fix your own bicycle.',
    email: 'hello@bikekitchen.org',
    website: 'https://bikekitchen.org',
    image: null,
    socials: [],
    actions: [],
    tags: [],
    location: null,
    featured: null,
    pending: false,
    inactive: false,
    edits: [],
    createdAt: '2026-01-05T10:00:00.000Z',
    updatedAt: '2026-02-11T10:00:00.000Z',
    sharedWith: [],
    ...overrides,
    category: { ...DEFAULT_CATEGORY, ...overrides.category },
  } as unknown as Listing
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}
