'use client'
import { useRouter } from 'next/navigation'
import { useCallback, use } from 'react'
import NextLink from 'next/link'
import { Spinner } from '@components/ui/spinner'
import { Button } from '@components/ui/button'
import { HiArrowLeft } from 'react-icons/hi'
import { PiInfoBold } from 'react-icons/pi'
import useListing from '@hooks/listings/useListing'
import useApplyListingEdit from '@hooks/listings/useApplyListingEdit'
import useListingEdits from '@hooks/listings/useListingEdits'
import { useAppContext } from '@store/hooks'
import ListingEditReview from '@components/admin/listing-form/listing-edit-review'

export default function ListingEditsPage({ params }) {
  // @ts-ignore
  const { slug } = use(params)
  const router = useRouter()
  const { selectedWebSlug } = useAppContext()

  const { listing, isPending: isLoadingListing } = useListing(slug)
  const { mutate: applyListingEdit } = useApplyListingEdit({
    webSlug: selectedWebSlug,
    listingSlug: slug,
  })
  const { listingEdits, isPending: isLoadingListingEdits } = useListingEdits(
    slug,
    selectedWebSlug,
  )

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  const handleSubmit = useCallback(() => {
    applyListingEdit({
      listingId: listing?.id,
      listingEditId: listingEdits[0]?.id,
    })
    router.push(`/admin/${slug}`)
  }, [applyListingEdit, listing?.id, listingEdits, router, slug])

  if (!listing || isLoadingListing || isLoadingListingEdits) {
    return <Spinner />
  }

  if (!listingEdits || listingEdits.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-10">
        <button
          className="mb-2 ml-2 flex items-center gap-2 text-gray-700 hover:text-gray-900"
          onClick={goBack}
        >
          <HiArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 rounded-md bg-blue-50 p-4 text-blue-700">
            <PiInfoBold className="h-5 w-5 shrink-0" />
            No pending edits found for this listing.
          </div>
          <Button onClick={goBack} variant="default">
            Go back to listings
          </Button>
        </div>
      </div>
    )
  }

  const editedListing = listingEdits[0]

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 md:px-10">
      <button
        className="mb-2 ml-2 flex items-center gap-2 text-gray-700 hover:text-gray-900"
        onClick={goBack}
      >
        <HiArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mt-4">
        <p className="mb-4 text-sm">
          You can view this listing at{' '}
          <NextLink
            href={`https://${selectedWebSlug}.resilienceweb.org.uk/${slug}`}
            target="_blank"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {selectedWebSlug}.resilienceweb.org.uk/{slug}
          </NextLink>
        </p>
        <div className="overflow-hidden">
          <div className="mb-8 flex items-start gap-3 rounded-md bg-purple-50 p-4 text-purple-900">
            <PiInfoBold className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              The changes highlighted below were submitted externally by{' '}
              {editedListing.user?.name ?? editedListing.user?.email}. Review
              them, and if everything looks okay click Accept changes. If the
              changes are incorrect or low quality, click Reject changes.
            </p>
          </div>
          <ListingEditReview
            listing={listing}
            editedListing={editedListing}
            handleSubmit={handleSubmit}
            webSlug={selectedWebSlug}
          />
        </div>
      </div>
    </div>
  )
}
