'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter, redirect } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import 'driver.js/dist/driver.css'
import posthog from 'posthog-js'
import { useSession } from '@auth-client'
import EditableList from '@components/admin/editable-list'
import Faq from '@components/faq'
import { Spinner } from '@components/ui/spinner'
import useDeleteListing from '@hooks/listings/useDeleteListing'
import useListings from '@hooks/listings/useListings'
import useCanEditWeb from '@hooks/web-access/useCanEditWeb'
import useAllowedWebs from '@hooks/webs/useAllowedWebs'
import { useAppContext } from '@store/hooks'
import { tour } from './tour'

const faqs = [
  {
    question: 'What does the "Pending" badge on a listing mean?',
    answer:
      'It means someone from the community proposed this listing for your web. Press the Review button to check the details, make any changes and approve it so it appears on your web.',
  },
  {
    question: 'What does the star button do?',
    answer:
      'It features a listing, displaying it at the top of your web page for 7 days. Press it again to unfeature the listing at any time.',
  },
  {
    question: 'What does the "View suggested edit" button mean?',
    answer:
      'Someone from the community suggested changes to that listing. Press the button to compare the suggested changes with the current version, and accept or reject them.',
  },
  {
    question: 'I added a listing but it is not showing on the web page. Why?',
    answer:
      'There might be a slight delay before new listings and edits appear on the public web page. If it still does not appear after a few minutes, check that the listing is not marked as inactive.',
  },
]

export default function AdminPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { selectedWebSlug } = useAppContext()
  const { canEdit: canEditCurrentWeb, isPending: isCheckingEditAccess } =
    useCanEditWeb()

  const {
    allowedWebs,
    myWebs,
    isLoadingWebs,
    isLoading: isLoadingAllowedWebs,
  } = useAllowedWebs()
  const { listings, isPending: isLoadingListings } = useListings()
  const { mutate: deleteListing } = useDeleteListing()

  const allowedListings = canEditCurrentWeb ? listings : null

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && session?.user) {
      console.log('Identifying user')
      posthog.identify(session.user.id, { email: session.user.email })
      Sentry.setUser({ id: session.user.id, email: session.user.email })
    }
  }, [session?.user])

  const clearSearchParams = () => {
    router.replace('/admin')
  }

  const searchParams = useSearchParams()
  const firstTime = searchParams.get('firstTime')
  useEffect(() => {
    if (firstTime === 'true') {
      posthog.capture('web-creation-dashboard-landing')
      const timeout = setTimeout(() => {
        tour.drive()
        clearSearchParams()
      }, 2000)
      return () => clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstTime])

  if (allowedWebs?.length === 0) {
    redirect('/admin/welcome')
  }

  // The web selector defaults the selection in an effect once the web list
  // arrives, so someone who has webs but no slug yet is on their way to one.
  // Falling through here is what made the dashboard flash "No listings yet".
  const isAwaitingWebSelection = !selectedWebSlug && (myWebs?.length ?? 0) > 0

  if (
    isLoadingWebs ||
    isLoadingAllowedWebs ||
    allowedWebs === null ||
    isAwaitingWebSelection ||
    (selectedWebSlug && (isLoadingListings || isCheckingEditAccess))
  ) {
    return <Spinner />
  }

  return (
    <div className="flex flex-col">
      <EditableList deleteListing={deleteListing} items={allowedListings} />
      <div className="mt-8 mb-8">
        <h3 className="mb-4 text-2xl font-bold">FAQs</h3>
        <Faq content={faqs} />
      </div>
    </div>
  )
}
