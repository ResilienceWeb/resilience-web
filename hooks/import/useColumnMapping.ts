/**
 * Hook for managing column mapping state and validation
 */
import { useState, useCallback, useMemo } from 'react'
import {
  applyAutoMapping,
  isMappingValid,
  getUnmappedRequiredFields,
  mapRows,
} from '@/lib/import/mapper'
import type { ColumnMapping, ListingField, MappedRow } from '@/lib/import/types'

interface UseColumnMappingProps {
  headers: string[]
  rows: Record<string, string>[]
}

interface UseColumnMappingResult {
  columnMapping: ColumnMapping
  updateMapping: (csvColumn: string, field: ListingField | null) => void
  resetMapping: () => void
  isValid: boolean
  unmappedRequiredFields: string[]
  mappedRows: MappedRow[]
}

// Helper to check if headers arrays are equal
function headersEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((h, i) => h === b[i])
}

export function useColumnMapping({
  headers,
  rows,
}: UseColumnMappingProps): UseColumnMappingResult {
  // Track previous headers and mapping together to handle prop changes
  // This follows React's pattern for adjusting state when props change
  const [prevHeaders, setPrevHeaders] = useState<string[]>(headers)
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(() =>
    applyAutoMapping(headers),
  )

  // Re-apply auto-detection when headers change (React's recommended pattern)
  if (!headersEqual(headers, prevHeaders) && headers.length > 0) {
    setPrevHeaders(headers)
    setColumnMapping(applyAutoMapping(headers))
  }

  const updateMapping = useCallback(
    (csvColumn: string, field: ListingField | null) => {
      setColumnMapping((prev) => ({
        ...prev,
        [csvColumn]: field,
      }))
    },
    [],
  )

  const resetMapping = useCallback(() => {
    setColumnMapping(applyAutoMapping(headers))
  }, [headers])

  const isValid = useMemo(() => isMappingValid(columnMapping), [columnMapping])

  const unmappedRequiredFields = useMemo(
    () => getUnmappedRequiredFields(columnMapping),
    [columnMapping],
  )

  const mappedRows = useMemo(
    () => mapRows(rows, columnMapping),
    [rows, columnMapping],
  )

  return {
    columnMapping,
    updateMapping,
    resetMapping,
    isValid,
    unmappedRequiredFields,
    mappedRows,
  }
}
