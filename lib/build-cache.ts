/**
 * Build-time data cache module
 *
 * This module provides a singleton cache for storing listing data during the Next.js build process.
 * It eliminates redundant database queries by caching data fetched in generateStaticParams()
 * and reusing it during page generation and metadata generation.
 *
 * The cache is only active during build time and is not used in production runtime.
 */

interface BuildCache {
  listings: Map<string, any>
  newsPosts: Map<string, any>
  initialized: boolean
  newsInitialized: boolean
}

const buildCache: BuildCache = {
  listings: new Map<string, any>(),
  newsPosts: new Map<string, any>(),
  initialized: false,
  newsInitialized: false,
}

/**
 * Detects if the current process is running during Next.js build time
 * @returns true if running during build, false otherwise
 */
export function isBuildTime(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

/**
 * Initializes the build cache with listing data
 * This should be called once in generateStaticParams() with all fetched listings
 *
 * @param listings - Array of listing objects with all required relations
 */
export function initializeBuildCache(listings: any[]): void {
  if (!isBuildTime()) {
    console.log(
      '[Build Cache] Not in build time, skipping cache initialization',
    )
    return
  }

  buildCache.listings.clear()

  for (const listing of listings) {
    // Create composite key: webSlug:listingSlug
    // Note: We need to get webSlug from the listing's web relation
    const webSlug = listing.web?.slug
    if (webSlug && listing.slug) {
      const key = `${webSlug}:${listing.slug}`
      buildCache.listings.set(key, listing)
    }
  }

  buildCache.initialized = true

  console.log(
    `[Build Cache] Initialized with ${buildCache.listings.size} listings`,
  )
}

/**
 * Retrieves a listing from the build cache
 *
 * @param webSlug - The web/subdomain slug
 * @param listingSlug - The listing slug
 * @returns The cached listing or null if not found
 */
export function getListingFromCache(
  webSlug: string,
  listingSlug: string,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
): any | null {
  if (!isBuildTime() || !buildCache.initialized) {
    return null
  }

  const key = `${webSlug}:${listingSlug}`
  const listing = buildCache.listings.get(key)

  if (listing) {
    console.log(`[Build Cache] Cache hit for ${key}`)
  } else {
    console.log(`[Build Cache] Cache miss for ${key}`)
  }

  return listing || null
}

/**
 * Initializes the build cache with Hygraph news posts
 * This should be called once in the news generateStaticParams() with all fetched posts.
 *
 * Caching full post data here means the per-page render and generateMetadata() can read
 * from memory instead of each issuing its own Hygraph request, which previously caused
 * bursts of concurrent requests and HTTP 429 rate limiting during build.
 *
 * @param posts - Array of news post objects keyed by their slug
 */
export function initializeNewsBuildCache(posts: any[]): void {
  if (!isBuildTime()) {
    console.log(
      '[Build Cache] Not in build time, skipping news cache initialization',
    )
    return
  }

  buildCache.newsPosts.clear()

  for (const post of posts) {
    if (post?.slug) {
      buildCache.newsPosts.set(post.slug, post)
    }
  }

  buildCache.newsInitialized = true

  console.log(
    `[Build Cache] Initialized with ${buildCache.newsPosts.size} news posts`,
  )
}

/**
 * Retrieves a news post from the build cache
 *
 * @param slug - The news post slug
 * @returns The cached post or null if not found
 */
export function getNewsPostFromCache(
  slug: string,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
): any | null {
  if (!isBuildTime() || !buildCache.newsInitialized) {
    return null
  }

  const post = buildCache.newsPosts.get(slug)

  if (post) {
    console.log(`[Build Cache] News cache hit for ${slug}`)
  } else {
    console.log(`[Build Cache] News cache miss for ${slug}`)
  }

  return post || null
}

/**
 * Clears the build cache
 * This is called after the build process completes to free memory
 */
export function clearBuildCache(): void {
  buildCache.listings.clear()
  buildCache.newsPosts.clear()
  buildCache.initialized = false
  buildCache.newsInitialized = false
  console.log('[Build Cache] Cache cleared')
}

/**
 * Gets cache statistics for monitoring
 * @returns Object with cache size and initialization status
 */
export function getCacheStats() {
  return {
    size: buildCache.listings.size,
    initialized: buildCache.initialized,
    isBuildTime: isBuildTime(),
  }
}
