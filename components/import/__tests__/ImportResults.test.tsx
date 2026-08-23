import type { ImportSummary, ImportRowResult } from '@/lib/import/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ImportResults } from '../ImportResults'

function summary(
  results: ImportRowResult[],
  overrides: Partial<ImportSummary> = {},
): ImportSummary {
  return {
    totalRows: results.length,
    successCount: results.filter((r) => r.success && !r.skipped).length,
    errorCount: results.filter((r) => !r.success && !r.skipped).length,
    skipCount: results.filter((r) => r.skipped).length,
    batches: [
      {
        batchNumber: 1,
        totalRows: results.length,
        successCount: results.filter((r) => r.success && !r.skipped).length,
        errorCount: results.filter((r) => !r.success && !r.skipped).length,
        skipCount: results.filter((r) => r.skipped).length,
        results,
      },
    ],
    completedAt: new Date('2026-01-15T10:30:00Z'),
    ...overrides,
  }
}

const ok = (rowNumber: number): ImportRowResult => ({
  rowNumber,
  success: true,
})
const failed = (rowNumber: number, error: string): ImportRowResult => ({
  rowNumber,
  success: false,
  error,
})
const skipped = (rowNumber: number): ImportRowResult => ({
  rowNumber,
  success: false,
  skipped: true,
  skipReason: 'duplicate',
})

describe('ImportResults', () => {
  it('reports a clean import as successful', () => {
    render(<ImportResults summary={summary([ok(1), ok(2)])} />)

    expect(
      screen.getByRole('heading', { name: /import completed successfully/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /download error report/i }),
    ).toBeNull()
    expect(screen.queryByText(/some rows were not imported/i)).toBeNull()
  })

  it('reports errors and offers the error report', () => {
    render(
      <ImportResults summary={summary([ok(1), failed(2, 'Missing name')])} />,
    )

    expect(
      screen.getByRole('heading', { name: /import completed with errors/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/some rows were not imported/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /download error report/i }),
    ).toBeInTheDocument()
  })

  it('offers the error report when rows were only skipped', () => {
    render(<ImportResults summary={summary([ok(1), skipped(2)])} />)

    // Skips are not failures, so the heading stays positive...
    expect(
      screen.getByRole('heading', { name: /import completed successfully/i }),
    ).toBeInTheDocument()
    // ...but the user still needs to know which rows were dropped.
    expect(
      screen.getByRole('button', { name: /download error report/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/1 rows were skipped/i)).toBeInTheDocument()
  })

  it('shows a count tile per outcome', () => {
    render(
      <ImportResults
        summary={summary([ok(1), ok(2), failed(3, 'Bad'), skipped(4)])}
      />,
    )

    const tile = (label: string) =>
      screen.getByText(label).parentElement?.querySelector('div')?.textContent

    expect(tile('Total rows')).toBe('4')
    expect(tile('Imported')).toBe('2')
    expect(tile('Skipped')).toBe('1')
    expect(tile('Errors')).toBe('1')
  })

  it('hides the skipped and error tiles when there are none', () => {
    render(<ImportResults summary={summary([ok(1)])} />)

    expect(screen.getByText('Total rows')).toBeInTheDocument()
    expect(screen.queryByText('Skipped')).toBeNull()
    expect(screen.queryByText('Errors')).toBeNull()
  })

  it('links onward to the listings and to another import', () => {
    render(<ImportResults summary={summary([ok(1)])} />)

    expect(
      screen.getByRole('link', { name: /view listings/i }),
    ).toHaveAttribute('href', '/admin')
    expect(screen.getByRole('link', { name: /import more/i })).toHaveAttribute(
      'href',
      '/admin/import',
    )
  })
})

describe('ImportResults error report download', () => {
  let downloaded: { blob: Blob; filename: string } | null = null

  beforeEach(() => {
    downloaded = null
    const blobs = new Map<string, Blob>()

    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      const url = `blob:${blobs.size}`
      blobs.set(url, blob as Blob)
      return url
    })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloaded = { blob: blobs.get(this.href), filename: this.download }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const csvFromClick = async () => {
    await userEvent.click(
      screen.getByRole('button', { name: /download error report/i }),
    )
    return downloaded.blob.text()
  }

  it('includes a row per error and skip, but not per success', async () => {
    render(
      <ImportResults
        summary={summary([ok(1), failed(2, 'Missing name'), skipped(3)])}
      />,
    )

    const csv = await csvFromClick()
    const lines = csv.split('\n')

    expect(lines[0]).toBe('Row Number,Status,Error Message')
    expect(lines).toHaveLength(3)
    expect(lines[1]).toBe('"2","Error","Missing name"')
    expect(lines[2]).toBe('"3","Skipped","Duplicate (duplicate)"')
  })

  it('escapes quotes so a comma in the message cannot break the CSV', async () => {
    render(
      <ImportResults
        summary={summary([failed(2, 'Field "name", is required')])}
      />,
    )

    const csv = await csvFromClick()

    expect(csv.split('\n')[1]).toBe('"2","Error","Field ""name"", is required"')
  })

  it('falls back to a generic message when the error has no text', async () => {
    render(
      <ImportResults summary={summary([{ rowNumber: 5, success: false }])} />,
    )

    const csv = await csvFromClick()

    expect(csv.split('\n')[1]).toBe('"5","Error","Unknown error"')
  })

  it('names the file with the current date', async () => {
    vi.setSystemTime(new Date('2026-03-09T12:00:00Z'))
    render(<ImportResults summary={summary([failed(1, 'Bad')])} />)

    await csvFromClick()

    expect(downloaded.filename).toBe('import-errors-2026-03-09.csv')
    vi.useRealTimers()
  })
})
