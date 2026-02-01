import { describe, it, expect } from 'vitest'
import {
  createBatches,
  normalizeForComparison,
  isDuplicate,
  createNameSet,
  filterDuplicates,
  processBatchResults,
  createImportSummary,
  createRowResult,
  extractNames,
  calculateProgress,
  mergeImportOptions,
  DEFAULT_BATCH_SIZE,
} from '../processor'
import type { MappedRow, ImportRowResult } from '../types'

describe('createBatches', () => {
  it('should create batches of specified size', () => {
    const items = Array.from({ length: 125 }, (_, i) => i)
    const batches = createBatches(items, 50)

    expect(batches).toHaveLength(3)
    expect(batches[0]).toHaveLength(50)
    expect(batches[1]).toHaveLength(50)
    expect(batches[2]).toHaveLength(25)
  })

  it('should handle empty array', () => {
    const batches = createBatches([], 50)
    expect(batches).toHaveLength(0)
  })

  it('should handle array smaller than batch size', () => {
    const items = [1, 2, 3]
    const batches = createBatches(items, 50)

    expect(batches).toHaveLength(1)
    expect(batches[0]).toHaveLength(3)
  })

  it('should handle batch size of 1', () => {
    const items = [1, 2, 3]
    const batches = createBatches(items, 1)

    expect(batches).toHaveLength(3)
    expect(batches[0]).toEqual([1])
    expect(batches[1]).toEqual([2])
    expect(batches[2]).toEqual([3])
  })

  it('should preserve item order', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    const batches = createBatches(items, 2)

    expect(batches[0]).toEqual(['a', 'b'])
    expect(batches[1]).toEqual(['c', 'd'])
    expect(batches[2]).toEqual(['e'])
  })
})

describe('normalizeForComparison', () => {
  it('should convert to lowercase', () => {
    expect(normalizeForComparison('TEST')).toBe('test')
    expect(normalizeForComparison('TeSt')).toBe('test')
  })

  it('should trim whitespace', () => {
    expect(normalizeForComparison('  test  ')).toBe('test')
    expect(normalizeForComparison('\ttest\n')).toBe('test')
  })

  it('should handle empty strings', () => {
    expect(normalizeForComparison('')).toBe('')
    expect(normalizeForComparison('   ')).toBe('')
  })

  it('should handle special characters', () => {
    expect(normalizeForComparison('Test & Co.')).toBe('test & co.')
    expect(normalizeForComparison('Test-123')).toBe('test-123')
  })
})

describe('isDuplicate', () => {
  it('should detect duplicates case-insensitively', () => {
    const existing = createNameSet(['Test Org', 'Another Org'])

    expect(isDuplicate('Test Org', existing)).toBe(true)
    expect(isDuplicate('test org', existing)).toBe(true)
    expect(isDuplicate('TEST ORG', existing)).toBe(true)
  })

  it('should handle whitespace variations', () => {
    const existing = createNameSet(['Test Org'])

    expect(isDuplicate('  Test Org  ', existing)).toBe(true)
    expect(isDuplicate('Test Org', existing)).toBe(true)
  })

  it('should return false for non-duplicates', () => {
    const existing = createNameSet(['Test Org'])

    expect(isDuplicate('Different Org', existing)).toBe(false)
    expect(isDuplicate('TestOrg', existing)).toBe(false)
  })

  it('should handle empty set', () => {
    const existing = createNameSet([])

    expect(isDuplicate('Any Name', existing)).toBe(false)
  })
})

describe('filterDuplicates', () => {
  it('should separate unique and duplicate rows', () => {
    const existingNames = createNameSet(['Existing Org'])
    const rows: MappedRow[] = [
      { name: 'New Org 1', rowNumber: 1 },
      { name: 'Existing Org', rowNumber: 2 }, // Duplicate with existing
      { name: 'New Org 2', rowNumber: 3 },
    ]

    const result = filterDuplicates(rows, existingNames)

    expect(result.unique).toHaveLength(2)
    expect(result.duplicates).toHaveLength(1)
    expect(result.duplicates[0].name).toBe('Existing Org')
  })

  it('should detect duplicates within the same batch', () => {
    const existingNames = createNameSet([])
    const rows: MappedRow[] = [
      { name: 'Org 1', rowNumber: 1 },
      { name: 'Org 2', rowNumber: 2 },
      { name: 'Org 1', rowNumber: 3 }, // Duplicate within batch
      { name: 'Org 3', rowNumber: 4 },
      { name: 'org 2', rowNumber: 5 }, // Case-insensitive duplicate
    ]

    const result = filterDuplicates(rows, existingNames)

    expect(result.unique).toHaveLength(3)
    expect(result.duplicates).toHaveLength(2)
    expect(result.duplicates.map((d) => d.rowNumber)).toEqual([3, 5])
  })

  it('should handle all duplicates', () => {
    const existingNames = createNameSet(['Org 1', 'Org 2'])
    const rows: MappedRow[] = [
      { name: 'Org 1', rowNumber: 1 },
      { name: 'Org 2', rowNumber: 2 },
    ]

    const result = filterDuplicates(rows, existingNames)

    expect(result.unique).toHaveLength(0)
    expect(result.duplicates).toHaveLength(2)
  })

  it('should handle all unique', () => {
    const existingNames = createNameSet([])
    const rows: MappedRow[] = [
      { name: 'Org 1', rowNumber: 1 },
      { name: 'Org 2', rowNumber: 2 },
      { name: 'Org 3', rowNumber: 3 },
    ]

    const result = filterDuplicates(rows, existingNames)

    expect(result.unique).toHaveLength(3)
    expect(result.duplicates).toHaveLength(0)
  })

  it('should handle empty array', () => {
    const existingNames = createNameSet([])
    const result = filterDuplicates([], existingNames)

    expect(result.unique).toHaveLength(0)
    expect(result.duplicates).toHaveLength(0)
  })

  it('should preserve row numbers', () => {
    const existingNames = createNameSet(['Org 1'])
    const rows: MappedRow[] = [
      { name: 'Org 1', rowNumber: 42 },
      { name: 'Org 2', rowNumber: 99 },
    ]

    const result = filterDuplicates(rows, existingNames)

    expect(result.duplicates[0].rowNumber).toBe(42)
    expect(result.unique[0].rowNumber).toBe(99)
  })
})

describe('extractNames', () => {
  it('should extract all names from rows', () => {
    const rows: MappedRow[] = [
      { name: 'Org 1', rowNumber: 1 },
      { name: 'Org 2', rowNumber: 2 },
      { name: 'Org 3', rowNumber: 3 },
    ]

    const names = extractNames(rows)
    expect(names).toEqual(['Org 1', 'Org 2', 'Org 3'])
  })

  it('should handle empty array', () => {
    const names = extractNames([])
    expect(names).toEqual([])
  })

  it('should filter out empty names', () => {
    const rows: MappedRow[] = [
      { name: 'Org 1', rowNumber: 1 },
      { name: '', rowNumber: 2 },
      { name: 'Org 3', rowNumber: 3 },
    ]

    const names = extractNames(rows)
    expect(names).toEqual(['Org 1', 'Org 3'])
  })
})

describe('processBatchResults', () => {
  it('should count successes, errors, and skips correctly', () => {
    const results: ImportRowResult[] = [
      { rowNumber: 1, success: true, listingId: 1 },
      { rowNumber: 2, success: false, error: 'Error' },
      { rowNumber: 3, success: false, skipped: true, skipReason: 'duplicate' },
      { rowNumber: 4, success: true, listingId: 2 },
    ]

    const batch = processBatchResults(results, 1)

    expect(batch.batchNumber).toBe(1)
    expect(batch.totalRows).toBe(4)
    expect(batch.successCount).toBe(2)
    expect(batch.errorCount).toBe(1)
    expect(batch.skipCount).toBe(1)
  })

  it('should handle all successes', () => {
    const results: ImportRowResult[] = [
      { rowNumber: 1, success: true, listingId: 1 },
      { rowNumber: 2, success: true, listingId: 2 },
    ]

    const batch = processBatchResults(results, 1)

    expect(batch.successCount).toBe(2)
    expect(batch.errorCount).toBe(0)
    expect(batch.skipCount).toBe(0)
  })

  it('should handle all errors', () => {
    const results: ImportRowResult[] = [
      { rowNumber: 1, success: false, error: 'Error 1' },
      { rowNumber: 2, success: false, error: 'Error 2' },
    ]

    const batch = processBatchResults(results, 1)

    expect(batch.successCount).toBe(0)
    expect(batch.errorCount).toBe(2)
    expect(batch.skipCount).toBe(0)
  })

  it('should handle all skipped', () => {
    const results: ImportRowResult[] = [
      { rowNumber: 1, success: false, skipped: true, skipReason: 'duplicate' },
      { rowNumber: 2, success: false, skipped: true, skipReason: 'duplicate' },
    ]

    const batch = processBatchResults(results, 1)

    expect(batch.successCount).toBe(0)
    expect(batch.errorCount).toBe(0)
    expect(batch.skipCount).toBe(2)
  })

  it('should handle empty results', () => {
    const batch = processBatchResults([], 1)

    expect(batch.totalRows).toBe(0)
    expect(batch.successCount).toBe(0)
    expect(batch.errorCount).toBe(0)
    expect(batch.skipCount).toBe(0)
  })
})

describe('createImportSummary', () => {
  it('should aggregate counts from multiple batches', () => {
    const batches = [
      processBatchResults(
        [
          { rowNumber: 1, success: true, listingId: 1 },
          { rowNumber: 2, success: false, error: 'Error' },
        ],
        1,
      ),
      processBatchResults(
        [
          { rowNumber: 3, success: true, listingId: 2 },
          {
            rowNumber: 4,
            success: false,
            skipped: true,
            skipReason: 'duplicate',
          },
        ],
        2,
      ),
    ]

    const summary = createImportSummary(batches)

    expect(summary.totalRows).toBe(4)
    expect(summary.successCount).toBe(2)
    expect(summary.errorCount).toBe(1)
    expect(summary.skipCount).toBe(1)
    expect(summary.batches).toHaveLength(2)
    expect(summary.completedAt).toBeInstanceOf(Date)
  })

  it('should handle empty batches array', () => {
    const summary = createImportSummary([])

    expect(summary.totalRows).toBe(0)
    expect(summary.successCount).toBe(0)
    expect(summary.errorCount).toBe(0)
    expect(summary.skipCount).toBe(0)
  })

  it('should handle batches with all zeros', () => {
    const batches = [processBatchResults([], 1)]
    const summary = createImportSummary(batches)

    expect(summary.totalRows).toBe(0)
    expect(summary.successCount).toBe(0)
  })
})

describe('createRowResult', () => {
  it('should create success result', () => {
    const result = createRowResult(1, {
      success: true,
      listingId: 42,
    })

    expect(result.rowNumber).toBe(1)
    expect(result.success).toBe(true)
    expect(result.listingId).toBe(42)
  })

  it('should create error result', () => {
    const result = createRowResult(2, {
      success: false,
      error: 'Validation failed',
    })

    expect(result.rowNumber).toBe(2)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Validation failed')
  })

  it('should create skipped result', () => {
    const result = createRowResult(3, {
      success: false,
      skipped: true,
      skipReason: 'duplicate',
    })

    expect(result.rowNumber).toBe(3)
    expect(result.skipped).toBe(true)
    expect(result.skipReason).toBe('duplicate')
  })
})

describe('calculateProgress', () => {
  it('should calculate percentage correctly', () => {
    expect(calculateProgress(0, 100)).toBe(0)
    expect(calculateProgress(50, 100)).toBe(50)
    expect(calculateProgress(100, 100)).toBe(100)
  })

  it('should round to nearest integer', () => {
    expect(calculateProgress(1, 3)).toBe(33)
    expect(calculateProgress(2, 3)).toBe(67)
  })

  it('should handle zero total', () => {
    expect(calculateProgress(0, 0)).toBe(0)
  })

  it('should handle current > total', () => {
    expect(calculateProgress(150, 100)).toBe(150)
  })

  it('should handle large numbers', () => {
    expect(calculateProgress(9999, 10000)).toBe(100)
  })
})

describe('mergeImportOptions', () => {
  it('should use defaults when no options provided', () => {
    const options = mergeImportOptions()

    expect(options.batchSize).toBe(DEFAULT_BATCH_SIZE)
    expect(options.skipDuplicates).toBe(true)
    expect(options.geocodeAddresses).toBe(true)
  })

  it('should merge custom options with defaults', () => {
    const options = mergeImportOptions({
      batchSize: 100,
      skipDuplicates: false,
    })

    expect(options.batchSize).toBe(100)
    expect(options.skipDuplicates).toBe(false)
    expect(options.geocodeAddresses).toBe(true) // Default
  })

  it('should allow all options to be overridden', () => {
    const options = mergeImportOptions({
      batchSize: 25,
      skipDuplicates: false,
      geocodeAddresses: false,
    })

    expect(options.batchSize).toBe(25)
    expect(options.skipDuplicates).toBe(false)
    expect(options.geocodeAddresses).toBe(false)
  })

  it('should handle partial options', () => {
    const options = mergeImportOptions({ batchSize: 10 })

    expect(options.batchSize).toBe(10)
    expect(options.skipDuplicates).toBe(true)
    expect(options.geocodeAddresses).toBe(true)
  })
})
