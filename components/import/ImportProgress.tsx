"use client";

/**
 * Progress indicator for import operation
 */

import { Loader2 } from "lucide-react";
import { Progress } from "@components/ui/progress";

interface ImportProgressProps {
  isImporting: boolean;
  message?: string;
}

export function ImportProgress({
  isImporting,
  message = "Processing import...",
}: ImportProgressProps) {
  if (!isImporting) return null;

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />

      <div className="text-center space-y-2">
        <p className="text-lg font-medium">{message}</p>
        <p className="text-sm text-gray-600">
          This may take a moment. Please don't close this page.
        </p>
      </div>

      <Progress value={undefined} className="w-full max-w-md" />
    </div>
  );
}
