/**
 * Hook for importing listings via API
 */
import type {
  ImportRequest,
  ImportSummary,
  ColumnMapping,
} from '@/lib/import/types'
import { useMutation } from '@tanstack/react-query'

interface ImportData {
  webSlug: string
  webId: number
  columnMapping: ColumnMapping
  rows: Record<string, string>[]
}

interface ImportResponse {
  success: boolean
  summary: ImportSummary
}

async function importListings(data: ImportData): Promise<ImportResponse> {
  const response = await fetch(
    `/api/listings/import?web=${encodeURIComponent(data.webSlug)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webId: data.webId,
        columnMapping: data.columnMapping,
        rows: data.rows,
      } as ImportRequest),
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Import failed')
  }

  return response.json()
}

export function useImportMutation() {
  return useMutation({
    mutationFn: importListings,
  })
}
