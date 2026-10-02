'use client'

import { useEffect } from 'react'
import { HiDownload } from 'react-icons/hi'
import { useRouter } from 'next/navigation'
import { Button } from '@components/ui/button'
import { Spinner } from '@components/ui/spinner'
import useCanEditWeb from '@hooks/web-access/useCanEditWeb'
import { useAppContext } from '@store/hooks'

export default function ExportPage() {
  const router = useRouter()
  const { canEdit, isPending } = useCanEditWeb()
  const { selectedWebSlug, selectedWebId } = useAppContext()

  const isAllowed = Boolean(selectedWebId) && canEdit

  useEffect(() => {
    if (!isPending && !isAllowed) {
      router.push('/admin')
    }
  }, [isPending, isAllowed, router])

  if (!isAllowed) {
    return <Spinner />
  }

  return (
    <div className="mb-6 flex max-w-[640px] flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Export Listings</h1>
        <p className="text-muted-foreground">
          Download every listing on your web as a CSV file, which you can open
          in Excel, Google Sheets or any other spreadsheet app.
        </p>
      </div>

      <div className="flex flex-col gap-3 text-sm text-gray-700">
        <p>
          Each listing gets one row, with its name, description, website,
          address, category and social media links.
        </p>
        <p>
          The columns match the ones Import from CSV looks for, so you can use
          the file to copy your listings into another web.
        </p>
      </div>

      <div>
        <Button asChild>
          <a
            href={`/api/listings/export?web=${encodeURIComponent(selectedWebSlug)}`}
            download
          >
            <HiDownload />
            Download CSV
          </a>
        </Button>
      </div>
    </div>
  )
}
