import { describe, it, expect } from 'vitest'
import type { ImportSummary, BatchImportResult } from '@/lib/import/types'

/**
 * Unit tests for ImportResults error report CSV generation logic
 *
 * Note: These tests focus on the CSV generation logic rather than full component rendering,
 * as React Testing Library is not currently configured in the project.
 */

describe('ImportResults - CSV Error Report Generation', () => {
  /**
   * Helper function that mimics the downloadErrorReport CSV generation logic
   * from ImportResults.tsx for testing purposes
   */
  function generateErrorReportCSV(summary: ImportSummary): string {
    const errors = summary.batches.flatMap((batch) =>
      batch.results.filter((r) => !r.success || r.skipped)
    )

    if (errors.length === 0) return ''

    const csvContent = [
      ['Row Number', 'Status', 'Error Message'].join(','),
      ...errors.map((error) =>
        [
          error.rowNumber,
          error.skipped ? 'Skipped' : 'Error',
          error.skipped
            ? `Duplicate (${error.skipReason})`
            : error.error || 'Unknown error',
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n')

    return csvContent
  }

  it('should generate CSV with headers and error rows', () => {
    const batches: BatchImportResult[] = [
      {
        batchNumber: 1,
        totalRows: 3,
        successCount: 1,
        errorCount: 1,
        skipCount: 1,
        results: [
          { rowNumber: 1, success: true, listingId: 1 },
          { rowNumber: 2, success: false, error: 'Validation failed' },
          { rowNumber: 3, success: false, skipped: true, skipReason: 'duplicate' },
        ],
      },
    ]

    const summary: ImportSummary = {
      totalRows: 3,
      successCount: 1,
      errorCount: 1,
      skipCount: 1,
      batches,
      completedAt: new Date(),
    }

    const csv = generateErrorReportCSV(summary)

    expect(csv).toContain('Row Number,Status,Error Message')
    expect(csv).toContain('"2","Error","Validation failed"')
    expect(csv).toContain('"3","Skipped","Duplicate (duplicate)"')
    expect(csv).not.toContain('"1"') // Successful row should not be included
  })

  it('should return empty string when no errors or skipped rows', () => {
    const batches: BatchImportResult[] = [
      {
        batchNumber: 1,
        totalRows: 2,
        successCount: 2,
        errorCount: 0,
        skipCount: 0,
        results: [
          { rowNumber: 1, success: true, listingId: 1 },
          { rowNumber: 2, success: true, listingId: 2 },
        ],
      },
    ]

    const summary: ImportSummary = {
      totalRows: 2,
      successCount: 2,
      errorCount: 0,
      skipCount: 0,
      batches,
      completedAt: new Date(),
    }

    const csv = generateErrorReportCSV(summary)

    expect(csv).toBe('')
  })

  it('should properly escape double quotes in error messages', () => {
    const batches: BatchImportResult[] = [
      {
        batchNumber: 1,
        totalRows: 1,
        successCount: 0,
        errorCount: 1,
        skipCount: 0,
        results: [
          {
            rowNumber: 1,
            success: false,
            error: 'Field "name" is required',
          },
        ],
      },
    ]

    const summary: ImportSummary = {
      totalRows: 1,
      successCount: 0,
      errorCount: 1,
      skipCount: 0,
      batches,
      completedAt: new Date(),
    }

    const csv = generateErrorReportCSV(summary)

    // Double quotes should be escaped as ""
    expect(csv).toContain('Field ""name"" is required')
  })

  it('should handle error messages with commas', () => {
    const batches: BatchImportResult[] = [
      {
        batchNumber: 1,
        totalRows: 1,
        successCount: 0,
        errorCount: 1,
        skipCount: 0,
        results: [
          {
            rowNumber: 1,
            success: false,
            error: 'Invalid fields: name, email, website',
          },
        ],
      },
    ]

    const summary: ImportSummary = {
      totalRows: 1,
      successCount: 0,
      errorCount: 1,
      skipCount: 0,
      batches,
      completedAt: new Date(),
    }

    const csv = generateErrorReportCSV(summary)

    // Error message should be quoted to preserve commas
    expect(csv).toContain('"Invalid fields: name, email, website"')
  })

  it('should handle error messages with newlines', () => {
    const batches: BatchImportResult[] = [
      {
        batchNumber: 1,
        totalRows: 1,
        successCount: 0,
        errorCount: 1,
        skipCount: 0,
        results: [
          {
            rowNumber: 1,
            success: false,
            error: 'Multiple errors:\nLine 1 error\nLine 2 error',
          },
        ],
      },
    ]

    const summary: ImportSummary = {
      totalRows: 1,
      successCount: 0,
      errorCount: 1,
      skipCount: 0,
      batches,
      completedAt: new Date(),
    }

    const csv = generateErrorReportCSV(summary)

    // Newlines should be preserved within quoted field
    expect(csv).toContain('Multiple errors:\nLine 1 error\nLine 2 error')
  })

  it('should handle undefined error message', () => {
    const batches: BatchImportResult[] = [
      {
        batchNumber: 1,
        totalRows: 1,
        successCount: 0,
        errorCount: 1,
        skipCount: 0,
        results: [
          {
            rowNumber: 1,
            success: false,
            // error is undefined
          },
        ],
      },
    ]

    const summary: ImportSummary = {
      totalRows: 1,
      successCount: 0,
      errorCount: 1,
      skipCount: 0,
      batches,
      completedAt: new Date(),
    }

    const csv = generateErrorReportCSV(summary)

    expect(csv).toContain('"Unknown error"')
  })

  it('should handle multiple batches with mixed results', () => {
    const batches: BatchImportResult[] = [
      {
        batchNumber: 1,
        totalRows: 2,
        successCount: 1,
        errorCount: 1,
        skipCount: 0,
        results: [
          { rowNumber: 1, success: true, listingId: 1 },
          { rowNumber: 2, success: false, error: 'Batch 1 error' },
        ],
      },
      {
        batchNumber: 2,
        totalRows: 2,
        successCount: 1,
        errorCount: 0,
        skipCount: 1,
        results: [
          { rowNumber: 3, success: true, listingId: 2 },
          { rowNumber: 4, success: false, skipped: true, skipReason: 'duplicate' },
        ],
      },
    ]

    const summary: ImportSummary = {
      totalRows: 4,
      successCount: 2,
      errorCount: 1,
      skipCount: 1,
      batches,
      completedAt: new Date(),
    }

    const csv = generateErrorReportCSV(summary)

    const lines = csv.split('\n')
    expect(lines).toHaveLength(3) // Header + 2 error rows

    expect(csv).toContain('"2","Error","Batch 1 error"')
    expect(csv).toContain('"4","Skipped","Duplicate (duplicate)"')
  })

  it('should handle validation_error skip reason', () => {
    const batches: BatchImportResult[] = [
      {
        batchNumber: 1,
        totalRows: 1,
        successCount: 0,
        errorCount: 0,
        skipCount: 1,
        results: [
          {
            rowNumber: 1,
            success: false,
            skipped: true,
            skipReason: 'validation_error',
          },
        ],
      },
    ]

    const summary: ImportSummary = {
      totalRows: 1,
      successCount: 0,
      errorCount: 0,
      skipCount: 1,
      batches,
      completedAt: new Date(),
    }

    const csv = generateErrorReportCSV(summary)

    expect(csv).toContain('"Duplicate (validation_error)"')
  })

  it('should handle large row numbers', () => {
    const batches: BatchImportResult[] = [
      {
        batchNumber: 1,
        totalRows: 1,
        successCount: 0,
        errorCount: 1,
        skipCount: 0,
        results: [
          {
            rowNumber: 9999,
            success: false,
            error: 'Error at large row',
          },
        ],
      },
    ]

    const summary: ImportSummary = {
      totalRows: 1,
      successCount: 0,
      errorCount: 1,
      skipCount: 0,
      batches,
      completedAt: new Date(),
    }

    const csv = generateErrorReportCSV(summary)

    expect(csv).toContain('"9999","Error","Error at large row"')
  })

  it('should handle special characters in error messages', () => {
    const batches: BatchImportResult[] = [
      {
        batchNumber: 1,
        totalRows: 1,
        successCount: 0,
        errorCount: 1,
        skipCount: 0,
        results: [
          {
            rowNumber: 1,
            success: false,
            error: 'Error: <script>alert("XSS")</script> & special chars',
          },
        ],
      },
    ]

    const summary: ImportSummary = {
      totalRows: 1,
      successCount: 0,
      errorCount: 1,
      skipCount: 0,
      batches,
      completedAt: new Date(),
    }

    const csv = generateErrorReportCSV(summary)

    // Double quotes should be escaped as ""
    expect(csv).toContain('<script>alert(""XSS"")</script> & special chars')
  })

  it('should handle empty batches array', () => {
    const summary: ImportSummary = {
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
      skipCount: 0,
      batches: [],
      completedAt: new Date(),
    }

    const csv = generateErrorReportCSV(summary)

    expect(csv).toBe('')
  })
})
