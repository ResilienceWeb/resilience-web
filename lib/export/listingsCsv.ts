import Papa from 'papaparse'

export interface ExportableListing {
  title: string
  description: string | null
  email: string | null
  website: string | null
  pending: boolean
  inactive: boolean
  location: { description: string | null } | null
  socials: { platform: string; url: string }[]
  category: { label: string } | null
}

// Header names are the ones the CSV importer auto-detects, so an export can be
// imported into another web without remapping any columns.
const SOCIAL_COLUMNS = {
  Facebook: 'facebook',
  Twitter: 'twitter',
  Instagram: 'instagram',
  LinkedIn: 'linkedin',
  YouTube: 'youtube',
} as const

const status = (listing: ExportableListing) => {
  if (listing.pending) return 'Pending'
  if (listing.inactive) return 'Inactive'
  return 'Live'
}

export function listingsToCsv(listings: ExportableListing[]): string {
  const rows = listings.map((listing) => {
    const socials = Object.fromEntries(
      Object.entries(SOCIAL_COLUMNS).map(([column, platform]) => [
        column,
        listing.socials.find((s) => s.platform === platform)?.url ?? '',
      ]),
    )

    return {
      Name: listing.title,
      Description: listing.description ?? '',
      Email: listing.email ?? '',
      Website: listing.website ?? '',
      Address: listing.location?.description ?? '',
      Category: listing.category?.label ?? '',
      ...socials,
      Status: status(listing),
    }
  })

  return Papa.unparse(
    {
      fields: [
        'Name',
        'Description',
        'Email',
        'Website',
        'Address',
        'Category',
        ...Object.keys(SOCIAL_COLUMNS),
        'Status',
      ],
      data: rows,
    },
    // Listing text is written by the public, and a cell starting with `=`
    // would run as a formula when an editor opens the file in a spreadsheet.
    { escapeFormulae: true },
  )
}
