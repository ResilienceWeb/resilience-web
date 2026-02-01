'use client'

/**
 * Table for mapping CSV columns to listing fields
 */
import { getAvailableFields } from '@/lib/import/mapper'
import type { ColumnMapping, ListingField } from '@/lib/import/types'
import { AlertCircle } from 'lucide-react'
import { Badge } from '@components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table'
import { ColumnSelect } from './ColumnSelect'

interface ColumnMappingTableProps {
  headers: string[]
  sampleData: Record<string, string>[]
  columnMapping: ColumnMapping
  onMappingChange: (csvColumn: string, field: ListingField) => void
  unmappedRequiredFields: string[]
}

export function ColumnMappingTable({
  headers,
  sampleData,
  columnMapping,
  onMappingChange,
  unmappedRequiredFields,
}: ColumnMappingTableProps) {
  // Show first 3 rows as sample
  const sampleRows = sampleData.slice(0, 3)

  return (
    <div className="space-y-4">
      {unmappedRequiredFields.length > 0 && (
        <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              Required fields not mapped
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Please map the following required fields:{' '}
              <span className="font-semibold">
                {unmappedRequiredFields.join(', ')}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-50">CSV Column</TableHead>
              <TableHead className="w-62.5">Maps to</TableHead>
              <TableHead>Sample Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {headers.map((header) => {
              const currentMapping = columnMapping[header]
              const availableFields = getAvailableFields(columnMapping, header)

              return (
                <TableRow key={header}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {header}
                      {currentMapping === 'name' && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ColumnSelect
                      value={currentMapping}
                      onChange={(field) => onMappingChange(header, field)}
                      availableFields={availableFields}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {sampleRows.map((row, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-gray-600 truncate max-w-md"
                          title={row[header]}
                        >
                          {row[header] || (
                            <span className="text-gray-400 italic">empty</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>Showing sample data from the first 3 rows</p>
        <p>{headers.length} columns detected</p>
      </div>
    </div>
  )
}
