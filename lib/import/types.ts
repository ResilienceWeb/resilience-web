/**
 * Type definitions for CSV import functionality
 */

/**
 * Represents the supported listing fields that can be imported
 */
export type ListingField =
  | 'name'
  | 'description'
  | 'email'
  | 'website'
  | 'address'
  | 'facebook'
  | 'twitter'
  | 'instagram'
  | 'linkedin'
  | 'youtube'

/**
 * Mapping of CSV column names to listing fields
 */
export type ColumnMapping = Record<string, ListingField | null>

/**
 * Parsed CSV data structure
 */
export interface ParsedCSVData {
  headers: string[]
  rows: Record<string, string>[]
  totalRows: number
}

/**
 * Mapped row data ready for import
 */
export interface MappedRow {
  name: string
  description?: string
  email?: string
  website?: string
  address?: string
  socialMedia?: SocialMediaLink[]
  rowNumber: number // Original row number in CSV
}

/**
 * Social media link structure
 */
export interface SocialMediaLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube'
  url: string
}

/**
 * Validation error for a single row
 */
export interface RowValidationError {
  rowNumber: number
  field: string
  message: string
  value?: string
}

/**
 * Validation result for all rows
 */
export interface ValidationResult {
  valid: boolean
  validRows: MappedRow[]
  invalidRows: RowValidationError[]
  totalErrors: number
}

/**
 * Geocoding result
 */
export interface GeocodingResult {
  latitude: number
  longitude: number
  description: string
  success: boolean
  error?: string
}

/**
 * Import result for a single row
 */
export interface ImportRowResult {
  rowNumber: number
  success: boolean
  listingId?: number
  error?: string
  skipped?: boolean
  skipReason?: 'duplicate' | 'validation_error'
}

/**
 * Batch import result
 */
export interface BatchImportResult {
  batchNumber: number
  totalRows: number
  successCount: number
  errorCount: number
  skipCount: number
  results: ImportRowResult[]
}

/**
 * Overall import summary
 */
export interface ImportSummary {
  totalRows: number
  successCount: number
  errorCount: number
  skipCount: number
  batches: BatchImportResult[]
  completedAt: Date
}

/**
 * Column mapping suggestion
 */
export interface ColumnSuggestion {
  csvColumn: string
  suggestedField: ListingField
  confidence: 'high' | 'medium' | 'low'
}

/**
 * Import request payload
 */
export interface ImportRequest {
  webId: number
  columnMapping: ColumnMapping
  rows: Record<string, string>[]
}

/**
 * Import options
 */
export interface ImportOptions {
  batchSize?: number
  skipDuplicates?: boolean
  geocodeAddresses?: boolean
}
