import { compressJson } from '@helpers/compression'

/**
 * Builds the `data` prop the web page receives: gzipped, base64-encoded network
 * data. Tests describe listings in plain terms and this puts them in the shape
 * the page decompresses on mount.
 */

export interface ListingFixture {
  title: string
  category: string
  description?: string
  tags?: string[]
  seekingVolunteers?: boolean
  featured?: string | null
}

export const CENTRAL_NODE_ID = 999

export function webData(
  listings: ListingFixture[],
  { webTitle = 'Bristol' } = {},
) {
  const categoryLabels = [...new Set(listings.map((l) => l.category))]

  const categoryNodes = categoryLabels.map((label, index) => ({
    id: 1000 + index,
    label,
    group: 'category',
    color: '#b0e3c1',
  }))

  const listingNodes = listings.map((listing, index) => ({
    id: index + 1,
    label: listing.title,
    description: listing.description ?? `About ${listing.title}`,
    group: 'listing',
    slug: listing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: { label: listing.category, color: '#b0e3c1' },
    tags: (listing.tags ?? []).map((label) => ({ label, color: '#b4fdbd' })),
    seekingVolunteers: listing.seekingVolunteers ?? false,
    featured: listing.featured ?? null,
    new: false,
  }))

  return compressJson({
    nodes: [
      { id: CENTRAL_NODE_ID, label: webTitle, group: 'central-node' },
      ...categoryNodes,
      ...listingNodes,
    ],
    edges: [],
  })
}
