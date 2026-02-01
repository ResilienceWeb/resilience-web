'use client'

/**
 * Main import wizard container orchestrating the 4-step import process
 */
import { useState } from 'react'
import { useCSVParser } from '@/hooks/import/useCSVParser'
import { useColumnMapping } from '@/hooks/import/useColumnMapping'
import { useImportMutation } from '@/hooks/import/useImportMutation'
import type { ImportSummary } from '@/lib/import/types'
import { validateRows } from '@/lib/import/validator'
import { ArrowLeft, ArrowRight, Upload as UploadIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { ColumnMappingTable } from './ColumnMappingTable'
import { DataPreviewTable } from './DataPreviewTable'
import { FileUploadZone } from './FileUploadZone'
import { ImportProgress } from './ImportProgress'
import { ImportResults } from './ImportResults'
import { ImportStepIndicator } from './ImportStepIndicator'
import { ValidationSummary } from './ValidationSummary'

interface ImportWizardProps {
  webSlug: string
  webId: number
}

export function ImportWizard({ webSlug, webId }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [importSummary, setImportSummary] = useState<ImportSummary>(null)

  // Step 1: File parsing
  const {
    data: csvData,
    error: parseError,
    isLoading: isParsing,
    parseFile,
  } = useCSVParser()

  // Step 2: Column mapping
  const {
    columnMapping,
    updateMapping,
    isValid: isMappingValid,
    unmappedRequiredFields,
    mappedRows,
  } = useColumnMapping({
    headers: csvData?.headers || [],
    rows: csvData?.rows || [],
  })

  // Step 3: Validation
  const validationResult =
    mappedRows.length > 0 ? validateRows(mappedRows) : null

  // Step 4: Import
  const importMutation = useImportMutation()

  const handleNext = () => {
    if (currentStep === 1 && !csvData) {
      toast.error('Please upload a CSV file first')
      return
    }

    if (currentStep === 2 && !isMappingValid) {
      toast.error(
        `Required fields not mapped: ${unmappedRequiredFields.join(', ')}`,
      )
      return
    }

    if (currentStep === 3 && validationResult && !validationResult.valid) {
      toast.error('Please fix validation errors before importing')
      return
    }

    if (currentStep === 3) {
      handleImport()
      return
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleImport = async () => {
    if (!csvData) return

    setCurrentStep(4)

    try {
      const result = await importMutation.mutateAsync({
        webSlug,
        webId,
        columnMapping,
        rows: csvData.rows,
      })

      setImportSummary(result.summary)
      toast.success('Import completed successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed')
      setCurrentStep(3) // Go back to preview on error
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FileUploadZone
            onFileSelect={parseFile}
            isLoading={isParsing}
            error={parseError}
          />
        )

      case 2:
        if (!csvData) return null
        return (
          <ColumnMappingTable
            headers={csvData.headers}
            sampleData={csvData.rows}
            columnMapping={columnMapping}
            onMappingChange={updateMapping}
            unmappedRequiredFields={unmappedRequiredFields}
          />
        )

      case 3:
        if (!validationResult) return null
        return (
          <div className="space-y-6">
            <ValidationSummary
              totalRows={csvData?.totalRows || 0}
              validCount={validationResult.validRows.length}
              invalidCount={validationResult.invalidRows.length}
              errors={validationResult.invalidRows}
            />
            {validationResult.valid && (
              <DataPreviewTable rows={validationResult.validRows} />
            )}
          </div>
        )

      case 4:
        if (importSummary) {
          return <ImportResults summary={importSummary} />
        }
        return (
          <ImportProgress
            isImporting={importMutation.isPending}
            message="Importing listings..."
          />
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    if (currentStep === 1) return csvData !== null && !parseError
    if (currentStep === 2) return isMappingValid
    if (currentStep === 3) return validationResult?.valid || false
    return false
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="mb-8">
        <ImportStepIndicator currentStep={currentStep} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Upload CSV file'}
            {currentStep === 2 && 'Map columns to fields'}
            {currentStep === 3 && 'Review & validate'}
            {currentStep === 4 && 'Import results'}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>

      {currentStep < 4 && (
        <div className="flex items-center justify-between mt-8">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={importMutation.isPending}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!canProceed() || importMutation.isPending}
            className={currentStep === 1 ? 'ml-auto' : ''}
          >
            {currentStep === 3 ? (
              <>
                <UploadIcon className="h-4 w-4 mr-2" />
                Start Import
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
