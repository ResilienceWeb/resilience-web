/**
 * Column mapping and auto-detection logic for CSV import
 */
import type {
  ColumnMapping,
  ColumnSuggestion,
  ListingField,
  MappedRow,
  SocialMediaLink,
} from './types'
import { sanitizeString, sanitizeUrl, isEmpty } from './validator'

type Confidence = ColumnSuggestion['confidence']

interface FieldPattern {
  pattern: RegExp
  confidence: Confidence
}

/**
 * Marks a pattern that is plausible but easily wrong — a short or generic word
 * that could just as well be a column about something else entirely.
 */
const loose = (pattern: RegExp): FieldPattern => ({
  pattern,
  confidence: 'medium',
})

/**
 * Auto-detection patterns for common column names.
 * Maps variations of column names to listing fields. A bare RegExp is a
 * hand-curated, unambiguous spelling and yields high confidence; wrap it in
 * `loose()` to downgrade it.
 */
const FIELD_PATTERNS: Record<ListingField, (RegExp | FieldPattern)[]> = {
  name: [
    /^name$/i,
    /^org[a-z]*\s*name$/i, // organization name, org name
    /^business\s*name$/i,
    /^company\s*name$/i,
    /^title$/i,
  ],
  description: [
    /^description$/i,
    /^desc$/i,
    /^about$/i,
    loose(/^details$/i),
    loose(/^info$/i),
    loose(/^information$/i),
  ],
  email: [/^email$/i, /^e-?mail$/i, /^contact\s*email$/i, /^email\s*address$/i],
  website: [
    /^website$/i,
    /^web\s*site$/i,
    /^url$/i,
    /^web\s*url$/i,
    /^web\s*address$/i,
    /^homepage$/i,
    loose(/^site$/i),
    loose(/^web$/i),
  ],
  address: [
    /^address$/i,
    /^location$/i,
    /^street\s*address$/i,
    /^full\s*address$/i,
  ],
  category: [
    /^category$/i,
    /^cat$/i,
    /^sector$/i,
    loose(/^type$/i),
    loose(/^group$/i),
  ],
  facebook: [/^facebook$/i, /^fb$/i, /^facebook\s*url$/i, /^facebook\s*link$/i],
  twitter: [
    /^twitter$/i,
    /^twitter\s*url$/i,
    /^twitter\s*handle$/i,
    loose(/^x$/i), // X (formerly Twitter)
  ],
  instagram: [/^instagram$/i, /^ig$/i, /^insta$/i, /^instagram\s*url$/i],
  linkedin: [/^linkedin$/i, /^linked\s*in$/i, /^linkedin\s*url$/i],
  youtube: [/^youtube$/i, /^yt$/i, /^youtube\s*url$/i, /^youtube\s*channel$/i],
}

const normalisePattern = (entry: RegExp | FieldPattern): FieldPattern =>
  entry instanceof RegExp ? { pattern: entry, confidence: 'high' } : entry

/**
 * Auto-detect field mapping from CSV headers
 */
export function autoDetectMapping(headers: string[]): ColumnSuggestion[] {
  const suggestions: ColumnSuggestion[] = []

  headers.forEach((header) => {
    const cleaned = header.trim()
    if (!cleaned) return

    // Try to match against known patterns
    for (const [field, patterns] of Object.entries(FIELD_PATTERNS)) {
      for (const entry of patterns) {
        const { pattern, confidence } = normalisePattern(entry)
        if (!pattern.test(cleaned)) continue

        suggestions.push({
          csvColumn: header,
          suggestedField: field as ListingField,
          confidence,
        })

        return // Stop after first match
      }
    }
  })

  return suggestions
}

/**
 * Apply auto-detected mapping suggestions to create initial column mapping
 */
export function applyAutoMapping(headers: string[]): ColumnMapping {
  const suggestions = autoDetectMapping(headers)
  const mapping: ColumnMapping = {}

  // Initialize all headers with null
  headers.forEach((header) => {
    mapping[header] = null
  })

  // Apply suggestions
  suggestions.forEach((suggestion) => {
    mapping[suggestion.csvColumn] = suggestion.suggestedField
  })

  return mapping
}

/**
 * Map raw CSV row to MappedRow using column mapping
 */
export function mapRow(
  csvRow: Record<string, string>,
  columnMapping: ColumnMapping,
  rowNumber: number,
): MappedRow {
  const mapped: Partial<MappedRow> = {
    rowNumber,
    socialMedia: [],
  }

  // Map each column to its corresponding field
  for (const [csvColumn, field] of Object.entries(columnMapping)) {
    if (!field) continue // Skip unmapped columns

    const value = csvRow[csvColumn]
    if (isEmpty(value)) continue

    // Handle social media fields separately
    const socialPlatforms: SocialMediaLink['platform'][] = [
      'facebook',
      'twitter',
      'instagram',
      'linkedin',
      'youtube',
    ]
    if (socialPlatforms.includes(field as SocialMediaLink['platform'])) {
      const url = sanitizeUrl(value)
      if (
        url &&
        (field === 'facebook' ||
          field === 'twitter' ||
          field === 'instagram' ||
          field === 'linkedin' ||
          field === 'youtube')
      ) {
        mapped.socialMedia?.push({
          platform: field,
          url,
        })
      }
    } else {
      // Handle regular fields
      switch (field) {
        case 'name':
          mapped.name = sanitizeString(value)
          break
        case 'description':
          mapped.description = sanitizeString(value)
          break
        case 'email':
          mapped.email = sanitizeString(value)
          break
        case 'website':
          mapped.website = sanitizeUrl(value)
          break
        case 'address':
          mapped.address = sanitizeString(value)
          break
        case 'category':
          mapped.category = sanitizeString(value)
          break
      }
    }
  }

  return mapped as MappedRow
}

/**
 * Map all CSV rows using column mapping
 */
export function mapRows(
  csvRows: Record<string, string>[],
  columnMapping: ColumnMapping,
): MappedRow[] {
  return csvRows.map((row, index) => mapRow(row, columnMapping, index + 1))
}

/**
 * Get unmapped required fields
 */
export function getUnmappedRequiredFields(
  columnMapping: ColumnMapping,
): string[] {
  const requiredFields: ListingField[] = ['name', 'description', 'category']
  const mappedFields = new Set(
    Object.values(columnMapping).filter((f) => f !== null),
  )

  return requiredFields.filter((field) => !mappedFields.has(field))
}

/**
 * Check if mapping is valid (all required fields mapped)
 */
export function isMappingValid(columnMapping: ColumnMapping): boolean {
  const unmapped = getUnmappedRequiredFields(columnMapping)
  return unmapped.length === 0
}

/**
 * Get available fields for mapping (excluding already mapped ones)
 */
export function getAvailableFields(
  columnMapping: ColumnMapping,
  currentColumn?: string,
): ListingField[] {
  const mappedFields = new Set(
    Object.entries(columnMapping)
      .filter(([col, field]) => field !== null && col !== currentColumn)
      .map(([, field]) => field),
  )

  const allFields: ListingField[] = [
    'name',
    'description',
    'email',
    'website',
    'address',
    'category',
    'facebook',
    'twitter',
    'instagram',
    'linkedin',
    'youtube',
  ]

  return allFields.filter((field) => !mappedFields.has(field))
}
