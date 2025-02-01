'use client'
import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Spinner } from '@components/ui/spinner'
import { Button } from '@components/ui/button'
import { PiInfoBold } from 'react-icons/pi'
import useCategoriesPublic from '@hooks/categories/useCategoriesPublic'
import useCreateListing from '@hooks/listings/useCreateListing'
import useSelectedWebSlug from '@hooks/application/useSelectedWebSlug'
import useWeb from '@hooks/webs/useWeb'
import Layout from '@components/layout'
import ListingFormSimplified from '@components/admin/listing-form/ListingFormSimplified'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'

export default function NewListing() {
  const selectedWebSlug = useSelectedWebSlug()
  const { categories, isPending: isCategoriesLoading } = useCategoriesPublic({
    webSlug: selectedWebSlug,
  })
  const { mutate: createListing } = useCreateListing()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { web } = useWeb({ webSlug: selectedWebSlug })

  const handleSubmit = useCallback(
    (data) => {
      data.webId = web?.id
      data.pending = true
      data.inactive = false
      data.relations = []
      createListing(data)
      setTimeout(() => {
        setIsSubmitted(true)
        if (window) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 1000)
    },
    [createListing, web?.id],
  )

  if (isCategoriesLoading) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="w-full md:max-w-[700px]">
        {isSubmitted ? (
          <>
            <h1 className="my-4 text-2xl font-bold">Thank you!</h1>
            <p>
              You have submitted your new proposed listing succesfully 🎉 <br />{' '}
              Thank you for your contribution. It will next be checked and
              hopefully approved by the admins of the{' '}
              <strong>{web?.title}</strong> web.
            </p>
            <Link href={`${PROTOCOL}://${selectedWebSlug}.${REMOTE_HOSTNAME}`}>
              <Button className="mt-8" variant="default">
                Go back to {web?.title} Resilience Web
              </Button>
            </Link>
          </>
        ) : (
          <>
            <h1 className="my-4 text-2xl font-bold">Propose new listing</h1>
            <p>
              You are proposing a new listing for the{' '}
              <strong>{web?.title}</strong> web.
            </p>
            <div className="my-8 overflow-hidden rounded-md shadow-md">
              <div className="flex items-start gap-3 rounded-t-md bg-blue-50 p-4 text-blue-700">
                <PiInfoBold className="h-5 w-5 shrink-0" />
                <p className="leading-relaxed">
                  Before you submit this form, please ensure that a listing for
                  the same entity doesn't already exist, and note that the
                  submission will only be approved if it is for a group that has
                  a positive contribution to the local community.
                </p>
              </div>
              <div className="space-y-6 bg-white">
                <ListingFormSimplified
                  categories={categories}
                  handleSubmit={handleSubmit}
                  isEditMode={false}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
