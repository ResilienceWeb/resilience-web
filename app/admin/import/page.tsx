'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Faq from '@components/faq'
import { ImportWizard } from '@components/import/ImportWizard'
import { Spinner } from '@components/ui/spinner'
import useCanEditWeb from '@hooks/web-access/useCanEditWeb'
import { useAppContext } from '@store/hooks'

const faqs = [
  {
    question: 'What should my CSV file contain?',
    answer:
      'A header row followed by one row per listing. Only a name column is required — you can also map columns for description, email, website, address, category and social media links during the import.',
  },
  {
    question: 'What happens if a listing already exists?',
    answer:
      'Rows whose name matches an existing listing on your web (or a duplicate name within the file) are skipped automatically, so you can safely re-run an import without creating duplicate listings.',
  },
  {
    question: 'What happens to rows with errors?',
    answer:
      'Problems are flagged in the validation step before anything is imported, and any skipped rows are listed in the results at the end along with the reason. All valid rows are still imported.',
  },
]

export default function ImportPage() {
  const router = useRouter()
  const canEditWeb = useCanEditWeb()
  const { selectedWebSlug, selectedWebId } = useAppContext()

  useEffect(() => {
    if (!selectedWebId || !canEditWeb) {
      router.push('/admin')
    }
  }, [selectedWebId, canEditWeb, router])

  if (!selectedWebId || !canEditWeb) {
    return <Spinner />
  }

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Import Listings</h1>
        <p className="text-muted-foreground">
          Import listings from a CSV file with column mapping and validation
        </p>
      </div>
      <ImportWizard webSlug={selectedWebSlug} webId={selectedWebId} />

      <div className="mt-8">
        <h3 className="mb-4 text-2xl font-bold">FAQs</h3>
        <Faq content={faqs} />
      </div>
    </div>
  )
}
