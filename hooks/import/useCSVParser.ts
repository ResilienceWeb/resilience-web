/**
 * Hook for parsing CSV files using papaparse
 */

import { useState, useCallback } from "react";
import Papa from "papaparse";
import type { ParsedCSVData } from "@/lib/import/types";

interface UseCSVParserResult {
  data: ParsedCSVData | null;
  error: string | null;
  isLoading: boolean;
  parseFile: (file: File) => Promise<void>;
  reset: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 10000;

export function useCSVParser(): UseCSVParserResult {
  const [data, setData] = useState<ParsedCSVData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const parseFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      // Validate file type
      if (!file.name.endsWith(".csv")) {
        throw new Error("Please upload a CSV file");
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit. Please split your file into smaller chunks.`
        );
      }

      // Parse CSV
      const result = await new Promise<ParsedCSVData>((resolve, reject) => {
        Papa.parse<Record<string, string>>(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim(),
          complete: (results) => {
            try {
              if (results.errors.length > 0) {
                const errorMessage = results.errors
                  .map((e) => e.message)
                  .join(", ");
                reject(new Error(`CSV parsing error: ${errorMessage}`));
                return;
              }

              if (results.data.length === 0) {
                reject(new Error("CSV file is empty"));
                return;
              }

              if (results.data.length > MAX_ROWS) {
                reject(
                  new Error(
                    `CSV contains ${results.data.length} rows, which exceeds the ${MAX_ROWS} row limit. Please split your file.`
                  )
                );
                return;
              }

              const headers = results.meta.fields || [];
              if (headers.length === 0) {
                reject(new Error("CSV file has no headers"));
                return;
              }

              resolve({
                headers,
                rows: results.data,
                totalRows: results.data.length,
              });
            } catch (err) {
              reject(err instanceof Error ? err : new Error(String(err)));
            }
          },
          error: (error) => {
            reject(new Error(`Failed to parse CSV: ${error.message}`));
          },
        });
      });

      setData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to parse CSV file";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    parseFile,
    reset,
  };
}
