"use client";

/**
 * Display validation errors and summary
 */

import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import type { RowValidationError } from "@/lib/import/types";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@components/ui/collapsible";
import { Button } from "@components/ui/button";
import { useState } from "react";

interface ValidationSummaryProps {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  errors: RowValidationError[];
}

export function ValidationSummary({
  totalRows: _totalRows,
  validCount,
  invalidCount,
  errors,
}: ValidationSummaryProps) {
  const [showErrors, setShowErrors] = useState(false);

  if (invalidCount === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">All rows valid</AlertTitle>
        <AlertDescription className="text-green-700">
          {validCount} rows ready to import with no errors detected.
        </AlertDescription>
      </Alert>
    );
  }

  // Group errors by row number
  const errorsByRow = errors.reduce((acc, error) => {
    if (!acc[error.rowNumber]) {
      acc[error.rowNumber] = [];
    }
    acc[error.rowNumber].push(error);
    return acc;
  }, {} as Record<number, RowValidationError[]>);

  const errorRowNumbers = Object.keys(errorsByRow).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Validation errors found</AlertTitle>
        <AlertDescription>
          {invalidCount} row(s) contain errors that must be fixed before importing.{" "}
          {validCount} row(s) are valid.
        </AlertDescription>
      </Alert>

      <Collapsible open={showErrors} onOpenChange={setShowErrors}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full">
            {showErrors ? "Hide" : "Show"} error details ({errors.length} errors)
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
            {errorRowNumbers.map((rowNumber) => (
              <div
                key={rowNumber}
                className="p-3 bg-red-50 border border-red-200 rounded-md"
              >
                <p className="font-medium text-sm text-red-900 mb-2">
                  Row {rowNumber}:
                </p>
                <ul className="space-y-1">
                  {errorsByRow[rowNumber].map((error, idx) => (
                    <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        <span className="font-medium">{error.field}:</span> {error.message}
                        {error.value && (
                          <span className="ml-1 text-red-600">
                            (value: "{error.value}")
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
