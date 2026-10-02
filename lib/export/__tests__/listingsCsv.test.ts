import { applyAutoMapping, mapRows } from '@/lib/import/mapper'
import Papa from 'papaparse'
import { describe, expect, it } from 'vitest'
import { type ExportableListing, listingsToCsv } from '../listingsCsv'

const listing = (
  overrides: Partial<ExportableListing> = {},
): ExportableListing => ({
  title: 'Bike Kitchen',
  description: '<p>Fix your bike</p>',
  website: null,
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

    expect(row).toMatchObject({
      name: 'Bike Kitchen',
      description: '<p>Fix your bike</p>',
      website: 'https://bikekitchen.org',
      address: '1 Mill Road, Cambridge',
      category: 'Transport',
      socialMedia: [
        { platform: 'instagram', url: 'https://instagram.com/bikekitchen' },
      ],
    })
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
      'Name,Description,Website,Address,Category,Facebook,Twitter,Instagram,LinkedIn,YouTube',
    )
  })
})
