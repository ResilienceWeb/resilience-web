'use client'

import { useCallback, use } from 'react'
import { HiArrowLeft } from 'react-icons/hi'
import { PiInfoBold } from 'react-icons/pi'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppContext } from '@store/hooks'
import ListingForm from '@components/admin/listing-form'
import { Spinner } from '@components/ui/spinner'
import useCategories from '@hooks/categories/useCategories'
import useListing from '@hooks/listings/useListing'
import useUpdateListing from '@hooks/listings/useUpdateListing'

export default function ListingPage({ params }) {
  // @ts-ignore
  const { slug } = use(params)
  const router = useRouter()
  const { categories } = useCategories()
  const { mutate: updateListing } = useUpdateListing()
  const { selectedWebSlug } = useAppContext()

  const goBack = useCallback(() => {
    router.push('/admin')
  }, [router])

  const handleSubmit = useCallback(
    (data) => {
      if (data.id) {
        data.isApprovingProposedListing = true
        updateListing(data)
      }
      goBack()
    },
    [updateListing, goBack],
  )

  const { listing, isPending } = useListing(slug)

  if (!categories || !listing || isPending) {
    return <Spinner />
  }

  return (
    <div className="mx-auto max-w-5xl px-0 py-4 md:px-10">
      <button
        className="mb-2 ml-2 flex items-center gap-2 text-gray-700 hover:text-gray-900"
        onClick={goBack}
      >
        <HiArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mt-4">
        {!listing.pending && (
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
        )}
        <div className="overflow-hidden rounded-none shadow-md md:rounded-md">
          {listing.pending && (
            <div className="flex items-center gap-3 bg-purple-50 p-4 text-purple-900">
              <PiInfoBold className="h-5 w-5 shrink-0" />
              <div>
                <p>
                  This listing was submitted externally and is currently in
                  pending state. Check through the information below, and if
                  everything looks okay click <strong>Approve</strong>.
                </p>
                <p>
                  Proposed by <strong>{listing.proposer.email}</strong>
                </p>
              </div>
            </div>
          )}
          <div className="bg-white">
            <ListingForm
              categories={categories}
              listing={listing}
              handleSubmit={handleSubmit}
              isSubmitting={isPending}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
