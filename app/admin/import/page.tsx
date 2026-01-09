'use client'

import { ImportWizard } from '@components/import/ImportWizard'
import { Spinner } from '@components/ui/spinner'
import useCanEditWeb from '@hooks/web-access/useCanEditWeb'
import { useAppContext } from '@store/hooks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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
    </div>
  )
}
