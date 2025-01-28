'use client'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@components/ui/button'
import { Spinner } from '@components/ui/spinner'
import { HiArrowLeft } from 'react-icons/hi'
import useCreateListing from '@hooks/listings/useCreateListing'
import useCategories from '@hooks/categories/useCategories'
import ListingForm from '@components/admin/listing-form'
import { useAppContext } from '@store/hooks'

export default function NewListingPage() {
  const router = useRouter()
  const { categories, isPending: isCategoriesPending } = useCategories()
  const { mutate: createListing } = useCreateListing()
  const { selectedWebId } = useAppContext()

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  const handleSubmit = useCallback(
    (data) => {
      data.webId = selectedWebId
      data.pending = false
      createListing(data)
      goBack()
    },
    [createListing, goBack, selectedWebId],
  )

  if (!categories || isCategoriesPending) {
    return <Spinner />
  }

  return (
    <div className="mx-auto max-w-5xl px-0 py-4 md:px-10">
      <Button
        variant="link"
        className="mb-2 ml-2 text-gray-700"
        onClick={goBack}
      >
        <HiArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mt-4 overflow-hidden rounded-md bg-white shadow-md sm:rounded-md">
        <div className="space-y-6">
          <ListingForm categories={categories} handleSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}
