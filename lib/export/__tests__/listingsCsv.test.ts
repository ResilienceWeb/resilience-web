import { applyAutoMapping, mapRows } from '@/lib/import/mapper'
import Papa from 'papaparse'
import { describe, expect, it } from 'vitest'
import { type ExportableListing, listingsToCsv } from '../listingsCsv'

const listing = (
  overrides: Partial<ExportableListing> = {},
): ExportableListing => ({
  title: 'Bike Kitchen',
  description: '<p>Fix your bike</p>',
  email: null,
  website: null,
  pending: false,
  inactive: false,
  location: null,
  socials: [],
  category: { label: 'Transport' },
  ...overrides,
})

const parse = (csv: string) =>
  Papa.parse<Record<string, string>>(csv, { header: true }).data

describe('listingsToCsv', () => {
  it('can be imported again without remapping any column', () => {
    const csv = listingsToCsv([
      listing({
        email: 'hello@bikekitchen.org',
        website: 'https://bikekitchen.org',
        location: { description: '1 Mill Road, Cambridge' },
        socials: [
          { platform: 'instagram', url: 'https://instagram.com/bikekitchen' },
        ],
      }),
    ])
    const { data, meta } = Papa.parse<Record<string, string>>(csv, {
      header: true,
    })

    const mapping = applyAutoMapping(meta.fields ?? [])
    const [row] = mapRows(data, mapping)

    expect(mapping.Status).toBeNull()
    expect(row).toMatchObject({
      name: 'Bike Kitchen',
      description: '<p>Fix your bike</p>',
      email: 'hello@bikekitchen.org',
      website: 'https://bikekitchen.org',
      address: '1 Mill Road, Cambridge',
      category: 'Transport',
      socialMedia: [
        { platform: 'instagram', url: 'https://instagram.com/bikekitchen' },
      ],
    })
  })

  it('says which listings are not live', () => {
    const csv = listingsToCsv([
      listing({ title: 'Live one' }),
      listing({ title: 'Proposed one', pending: true }),
      listing({ title: 'Closed one', inactive: true }),
    ])

    expect(parse(csv).map((r) => [r.Name, r.Status])).toEqual([
      ['Live one', 'Live'],
      ['Proposed one', 'Pending'],
      ['Closed one', 'Inactive'],
    ])
  })

  it('keeps commas, quotes and line breaks inside their cell', () => {
    const description = 'Bikes, "tools"\nand tea'
    const csv = listingsToCsv([listing({ description })])

    expect(parse(csv)[0]?.Description).toBe(description)
  })

  it('stops a listing from smuggling a formula into the spreadsheet', () => {
    const csv = listingsToCsv([listing({ title: '=HYPERLINK("evil")' })])

    expect(parse(csv)[0]?.Name).toBe(`'=HYPERLINK("evil")`)
  })

  it('still has a header row when the web has no listings', () => {
    expect(listingsToCsv([]).split('\r\n')[0]).toBe(
      'Name,Description,Email,Website,Address,Category,Facebook,Twitter,Instagram,LinkedIn,YouTube,Status',
    )
  })
})
