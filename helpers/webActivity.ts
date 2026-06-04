const getLatestListingUpdate = (listings) => {
  if (!listings?.length) return null

  let latestDate = null
  for (const listing of listings) {
    if (!listing.updatedAt) continue
    const date = new Date(listing.updatedAt)
    if (!latestDate || date > latestDate) {
      latestDate = date
    }
  }
  return latestDate
}

export const getLastActivityDate = (web) => {
  const webLastUpdated = web.updatedAt ? new Date(web.updatedAt) : null
  const listingsLastUpdated = getLatestListingUpdate(web.listings)

  if (!webLastUpdated) return listingsLastUpdated
  if (!listingsLastUpdated) return webLastUpdated

  return new Date(
    Math.max(webLastUpdated.getTime(), listingsLastUpdated.getTime()),
  )
}

export const isWebActive = (web) => {
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const lastActivity = getLastActivityDate(web)
  if (!lastActivity) return false

  return lastActivity > threeMonthsAgo
}
