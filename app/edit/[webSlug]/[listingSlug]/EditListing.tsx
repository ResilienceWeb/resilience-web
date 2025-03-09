'use client'
import { useCallback, useState } from 'react'
import { PiInfoBold } from 'react-icons/pi'
import { Spinner } from '@components/ui/spinner'
import Layout from '@components/layout'
import ListingFormSimplified from '@components/admin/listing-form/ListingFormSimplified'
import useCategoriesPublic from '@hooks/categories/useCategoriesPublic'
import useCreateListingEdit from '@hooks/listings/useCreateListingEdit'
import useListingEdits from '@hooks/listings/useListingEdits'
import useWeb from '@hooks/webs/useWeb'
import Link from 'next/link'
import { Button } from '@components/ui/button'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'

export default function EditListing({ listing, webSlug }) {
  const { categories, isPending: isCategoriesLoading } = useCategoriesPublic({
    webSlug,
  })
  const { web } = useWeb({ webSlug })
  const { mutate: createListingEdit } = useCreateListingEdit()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { listingEdits, isPending: isLoadingEdits } = useListingEdits(
    listing.slug,
    webSlug,
  )

  const handleSubmit = useCallback(
    (data) => {
      data.webId = web?.id
      data.listingId = listing.id
      data.inactive = false
      data.relations = []
      createListingEdit(data)
      setTimeout(() => {
        setIsSubmitted(true)
        if (window) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 1000)
    },
    [web?.id, listing.id, createListingEdit],
  )

  if (isCategoriesLoading || isLoadingEdits) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    )
  }

  if (listingEdits && listingEdits.length > 0) {
    return (
      <Layout>
        <div className="mt-12 w-full md:max-w-[700px]">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center rounded-md bg-blue-50 p-4 text-blue-700">
              <svg
                className="mr-3 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              This listing cannot be edited as there is already a suggested edit
              under review for it.
            </div>
            <Link
              href={`${PROTOCOL}://${webSlug}.${REMOTE_HOSTNAME}/${listing.slug}`}
              className="rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-800"
            >
              Go back to listing
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="w-full md:max-w-[700px]">
        {isSubmitted ? (
          <>
            <h1 className="my-4 text-2xl font-bold">Thank you!</h1>
            <p className="mb-8">
              You have submitted your changes succesfully 🎉 <br /> Thank you
              for your contribution. It will be checked and hopefully approved
              by the admins of the <strong>{web?.title}</strong> web.
            </p>
            <Link href={`${PROTOCOL}://${webSlug}.${REMOTE_HOSTNAME}`}>
              <Button className="mt-2">
                Go back to {web?.title} Resilience Web
              </Button>
            </Link>
          </>
        ) : (
          <div className="my-8 overflow-hidden rounded-md shadow-md">
            <div className="flex items-center gap-3 bg-blue-50 p-4 text-blue-700">
              <PiInfoBold className="shrink-0" />
              You are now editing a listing. Note that your changes will be
              submitted to the maintainers of the {web?.title} Resilience Web,
              who will review your suggested changes. Thank you for taking the
              keep information up to date. You're a ⭐!
            </div>
            <ListingFormSimplified
              listing={listing}
              categories={categories}
              handleSubmit={handleSubmit}
              isEditMode
            />
          </div>
        )}
      </div>
    </Layout>
  )
}
