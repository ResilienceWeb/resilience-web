/**
 * Hook for managing column mapping state and validation
 */

import { useState, useCallback, useMemo } from "react";
import {
  applyAutoMapping,
  isMappingValid,
  getUnmappedRequiredFields,
  mapRows,
} from "@/lib/import/mapper";
import type {
  ColumnMapping,
  ListingField,
  MappedRow,
} from "@/lib/import/types";

interface UseColumnMappingProps {
  headers: string[];
  rows: Record<string, string>[];
}

interface UseColumnMappingResult {
  columnMapping: ColumnMapping;
  updateMapping: (csvColumn: string, field: ListingField | null) => void;
  resetMapping: () => void;
  isValid: boolean;
  unmappedRequiredFields: string[];
  mappedRows: MappedRow[];
}

export function useColumnMapping({
  headers,
  rows,
}: UseColumnMappingProps): UseColumnMappingResult {
  // Initialize with auto-detected mapping
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(() =>
    applyAutoMapping(headers)
  );

  const updateMapping = useCallback(
    (csvColumn: string, field: ListingField | null) => {
      setColumnMapping((prev) => ({
        ...prev,
        [csvColumn]: field,
      }));
    },
    []
  );

  const resetMapping = useCallback(() => {
    setColumnMapping(applyAutoMapping(headers));
  }, [headers]);

  const isValid = useMemo(
    () => isMappingValid(columnMapping),
    [columnMapping]
  );

  const unmappedRequiredFields = useMemo(
    () => getUnmappedRequiredFields(columnMapping),
    [columnMapping]
  );

  const mappedRows = useMemo(
    () => mapRows(rows, columnMapping),
    [rows, columnMapping]
  );

  return {
    columnMapping,
    updateMapping,
    resetMapping,
    isValid,
    unmappedRequiredFields,
    mappedRows,
  };
}
