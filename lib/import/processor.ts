/**
 * Import processor for chunked batch processing and duplicate detection
 */
import type {
  MappedRow,
  ImportRowResult,
  BatchImportResult,
  ImportSummary,
  ImportOptions,
} from './types'

/**
 * Default batch size for chunked processing
 */
export const DEFAULT_BATCH_SIZE = 50

/**
 * Split rows into batches
 */
export function createBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = []

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }

  return batches
}

/**
 * Normalize string for duplicate comparison (case-insensitive, trimmed)
 */
export function normalizeForComparison(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * Check if a listing is a duplicate based on name
 */
export function isDuplicate(name: string, existingNames: Set<string>): boolean {
  const normalized = normalizeForComparison(name)
  return existingNames.has(normalized)
}

/**
 * Create a set of normalized names for duplicate detection
 */
export function createNameSet(names: string[]): Set<string> {
  return new Set(names.map(normalizeForComparison))
}

/**
 * Process a single batch of import results
 */
export function processBatchResults(
  results: ImportRowResult[],
  batchNumber: number,
): BatchImportResult {
  const successCount = results.filter((r) => r.success).length
  const errorCount = results.filter((r) => !r.success && !r.skipped).length
  const skipCount = results.filter((r) => r.skipped).length

  return {
    batchNumber,
    totalRows: results.length,
    successCount,
    errorCount,
    skipCount,
    results,
  }
}

/**
 * Create overall import summary from batch results
 */
export function createImportSummary(
  batches: BatchImportResult[],
): ImportSummary {
  const totalRows = batches.reduce((sum, batch) => sum + batch.totalRows, 0)
  const successCount = batches.reduce(
    (sum, batch) => sum + batch.successCount,
    0,
  )
  const errorCount = batches.reduce((sum, batch) => sum + batch.errorCount, 0)
  const skipCount = batches.reduce((sum, batch) => sum + batch.skipCount, 0)

  return {
    totalRows,
    successCount,
    errorCount,
    skipCount,
    batches,
    completedAt: new Date(),
  }
}

/**
 * Create import row result
 */
export function createRowResult(
  rowNumber: number,
  options: {
    success: boolean
    listingId?: number
    error?: string
    skipped?: boolean
    skipReason?: 'duplicate' | 'validation_error'
  },
): ImportRowResult {
  return {
    rowNumber,
    ...options,
  }
}

/**
 * Extract all names from mapped rows
 */
export function extractNames(rows: MappedRow[]): string[] {
  return rows.map((row) => row.name).filter((name) => !!name)
}

/**
 * Filter out duplicate rows from a batch
 */
export function filterDuplicates(
  rows: MappedRow[],
  existingNames: Set<string>,
): {
  unique: MappedRow[]
  duplicates: MappedRow[]
} {
  const unique: MappedRow[] = []
  const duplicates: MappedRow[] = []

  const seenInBatch = new Set<string>()

  rows.forEach((row) => {
    const normalizedName = normalizeForComparison(row.name)

    // Check against existing listings and within batch
    if (existingNames.has(normalizedName) || seenInBatch.has(normalizedName)) {
      duplicates.push(row)
    } else {
      unique.push(row)
      seenInBatch.add(normalizedName)
    }
  })

  return { unique, duplicates }
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(
  currentRow: number,
  totalRows: number,
): number {
  if (totalRows === 0) return 0
  return Math.round((currentRow / totalRows) * 100)
}

/**
 * Merge import options with defaults
 */
export function mergeImportOptions(
  options?: Partial<ImportOptions>,
): ImportOptions {
  return {
    batchSize: options?.batchSize ?? DEFAULT_BATCH_SIZE,
    skipDuplicates: options?.skipDuplicates ?? true,
    geocodeAddresses: options?.geocodeAddresses ?? true,
  }
}
