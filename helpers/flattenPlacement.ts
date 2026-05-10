/**
 * Hoists fields from a listing's first placement onto the listing itself, preserving the
 * pre-multi-web API shape (`listing.slug`, `listing.category`, `listing.tags`, `listing.featured`,
 * `listing.web`). Used in API responses while we migrate consumers to read from `listing.placements`
 * directly.
 *
 * The `placements` array is preserved so callers that need the full set still get it.
 */

type PlacementShape = {
  slug: string
  categoryId: number | null
  category?: unknown
  tags?: unknown
  featured: Date | null
  web?: unknown
}

type ListingShape = {
  placements: PlacementShape[]
  [key: string]: unknown
}

export function flattenListingPlacement<T extends ListingShape>(listing: T) {
  const placement = listing.placements[0]
  if (!placement) {
    return {
      ...listing,
      slug: null,
      categoryId: null,
      category: null,
      tags: [],
      featured: null,
      web: null,
    }
  }

  return {
    ...listing,
    slug: placement.slug,
    categoryId: placement.categoryId,
    category: placement.category ?? null,
    tags: placement.tags ?? [],
    featured: placement.featured,
    web: placement.web ?? null,
  }
}
