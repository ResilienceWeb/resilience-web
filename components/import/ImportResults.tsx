'use client'

/**
 * Display import results summary with downloadable error report
 */
import Link from 'next/link'
import type { ImportSummary } from '@/lib/import/types'
import { CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react'
import { Button } from '@components/ui/button'

interface ImportResultsProps {
  summary: ImportSummary
}

export function ImportResults({ summary }: ImportResultsProps) {
  const {
    totalRows,
    successCount,
    errorCount,
    skipCount,
    batches,
    completedAt,
  } = summary

  const hasErrors = errorCount > 0
  const hasSkipped = skipCount > 0

  // Generate error report CSV
  const downloadErrorReport = () => {
    const errors = batches.flatMap((batch) =>
      batch.results.filter((r) => !r.success || r.skipped),
    )

    if (errors.length === 0) return

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
          .join(','),
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `import-errors-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        {hasErrors ? (
          <>
            <XCircle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold">
              Import Completed with Errors
            </h3>
          </>
        ) : (
          <>
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold">
              Import Completed Successfully
            </h3>
          </>
        )}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">{totalRows}</div>
            <div className="text-sm text-gray-600 mt-1">Total Rows</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {successCount}
            </div>
            <div className="text-sm text-gray-600 mt-1">Imported</div>
          </div>

          {hasSkipped && (
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-3xl font-bold text-amber-600">
                {skipCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">Skipped</div>
            </div>
          )}

          {hasErrors && (
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">
                {errorCount}
              </div>
              <div className="text-sm text-gray-600 mt-1">Errors</div>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 mt-6">
          Completed at {new Date(completedAt).toLocaleString()}
        </div>

        {(hasErrors || hasSkipped) && (
          <div className="space-y-3 mt-6 mb-4">
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">
                  Some rows were not imported
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  {skipCount > 0 &&
                    `${skipCount} rows were skipped (duplicates). `}
                  {errorCount > 0 && `${errorCount} rows failed due to errors.`}
                </p>
              </div>
            </div>

            <Button
              onClick={downloadErrorReport}
              variant="outline"
              className="w-full mt-6"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Error Report (CSV)
            </Button>
          </div>
        )}

        <div className="flex gap-3 mt-7">
          <Button asChild className="flex-1">
            <Link href="/admin">View Listings</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/admin/import">Import More</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
