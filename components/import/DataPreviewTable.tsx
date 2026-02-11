'use client'

/**
 * Preview table showing mapped data before import
 */
import type { MappedRow } from '@/lib/import/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'

interface DataPreviewTableProps {
  rows: MappedRow[]
  maxRows?: number
}

export function DataPreviewTable({
  rows,
  maxRows = 10,
}: DataPreviewTableProps) {
  const previewRows = rows.slice(0, maxRows)

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-125">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-15">Row</TableHead>
                <TableHead className="min-w-50">Name</TableHead>
                <TableHead className="min-w-75">Description</TableHead>
                <TableHead className="min-w-37.5">Email</TableHead>
                <TableHead className="min-w-37.5">Website</TableHead>
                <TableHead className="min-w-50">Address</TableHead>
                <TableHead className="min-w-37.5">Category</TableHead>
                <TableHead className="min-w-37.5">Social media</TableHead>
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
                  <TableCell>
                    {row.email || (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.website ? (
                      <a
                        href={row.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block max-w-37.5"
                        title={row.website}
                      >
                        {row.website}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-50 truncate" title={row.address}>
                      {row.address || (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.category || (
                      <span className="text-gray-400 italic">—</span>
                    )}
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
  )
}
