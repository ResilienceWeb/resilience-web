"use client";

/**
 * Preview table showing mapped data before import
 */

import type { MappedRow } from "@/lib/import/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";

interface DataPreviewTableProps {
  rows: MappedRow[];
  maxRows?: number;
}

export function DataPreviewTable({
  rows,
  maxRows = 10,
}: DataPreviewTableProps) {
  const previewRows = rows.slice(0, maxRows);

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Row</TableHead>
                <TableHead className="min-w-[200px]">Name</TableHead>
                <TableHead className="min-w-[300px]">Description</TableHead>
                <TableHead className="min-w-[150px]">Email</TableHead>
                <TableHead className="min-w-[150px]">Website</TableHead>
                <TableHead className="min-w-[120px]">Phone</TableHead>
                <TableHead className="min-w-[200px]">Address</TableHead>
                <TableHead className="min-w-[150px]">Social Media</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((row) => (
                <TableRow key={row.rowNumber}>
                  <TableCell className="font-medium text-gray-500">
                    {row.rowNumber}
                  </TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>
                    <div className="max-w-md truncate" title={row.description}>
                      {row.description || (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{row.email || <span className="text-gray-400 italic">—</span>}</TableCell>
                  <TableCell>
                    {row.website ? (
                      <a
                        href={row.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block max-w-[150px]"
                        title={row.website}
                      >
                        {row.website}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </TableCell>
                  <TableCell>{row.phone || <span className="text-gray-400 italic">—</span>}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={row.address}>
                      {row.address || <span className="text-gray-400 italic">—</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.socialMedia && row.socialMedia.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {row.socialMedia.map((social, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {social.platform}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Showing {previewRows.length} of {rows.length} rows
        {rows.length > maxRows && ` (first ${maxRows} rows)`}
      </div>
    </div>
  );
}
