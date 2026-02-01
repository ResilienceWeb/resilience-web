"use client";

/**
 * File upload zone with drag-and-drop support
 */

import { useCallback, useState } from "react";
import { Upload, FileText, X, Download } from "lucide-react";
import { cn } from "@components/lib/utils";

const CSV_TEMPLATE_HEADERS = [
  "Name",
  "Description",
  "Email",
  "Website",
  "Phone",
  "Address",
  "Category",
  "Tags",
  "Facebook",
  "Instagram",
  "X",
  "LinkedIn",
  "YouTube",
];

function downloadTemplate() {
  const csvContent = CSV_TEMPLATE_HEADERS.join(",") + "\n";
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "resilience-web-import-template.csv";
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function FileUploadZone({
  onFileSelect,
  isLoading = false,
  error,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const csvFile = files.find((file) => file.name.endsWith(".csv"));

      if (csvFile) {
        setSelectedFile(csvFile);
        onFileSelect(csvFile);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleClearFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  }, []);

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors",
          selectedFile
            ? "border-green-500 bg-green-50 dark:bg-green-950/20"
            : isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          isLoading && "opacity-50 pointer-events-none"
        )}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
            <FileText className="w-12 h-12 mb-4 text-green-600 dark:text-green-400" />
            <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
            <button
              type="button"
              onClick={handleClearFile}
              disabled={isLoading}
              className="relative z-10 mt-4 flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
            <Upload
              className={cn(
                "w-12 h-12 mb-4 transition-colors",
                isDragging ? "text-primary" : "text-gray-400"
              )}
            />
            <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              CSV file (max 5MB, up to 10,000 rows)
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                downloadTemplate();
              }}
              className="relative z-10 mt-4 flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download blank template
            </button>
          </div>
        )}
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          disabled={isLoading}
          className="absolute inset-0 z-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          <span className="ml-2 text-sm text-gray-600">Parsing CSV...</span>
        </div>
      )}
    </div>
  );
}
