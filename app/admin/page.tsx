'use client'

import { useEffect, useMemo } from 'react'
import { useSearchParams, useRouter, redirect } from 'next/navigation'
import 'driver.js/dist/driver.css'
import posthog from 'posthog-js'
import { useSession } from '@auth-client'
import EditableList from '@components/admin/editable-list'
import { Spinner } from '@components/ui/spinner'
import useDeleteListing from '@hooks/listings/useDeleteListing'
import useListings from '@hooks/listings/useListings'
import useCanEditWeb from '@hooks/web-access/useCanEditWeb'
import useAllowedWebs from '@hooks/webs/useAllowedWebs'
import { useAppContext } from '@store/hooks'
import { tour } from './tour'

export default function AdminPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { selectedWebId } = useAppContext()
  const { canEdit: canEditCurrentWeb, isPending: isCheckingEditAccess } =
    useCanEditWeb()

  const {
    allowedWebs,
    isLoadingWebs,
    isLoading: isLoadingAllowedWebs,
  } = useAllowedWebs()
  const { listings, isPending: isLoadingListings } = useListings()
  const { mutate: deleteListing } = useDeleteListing()

  const allowedListings = useMemo(() => {
    if (isLoadingListings || isCheckingEditAccess) return null
    if (canEditCurrentWeb) return listings

    return null
  }, [isLoadingListings, listings, canEditCurrentWeb, isCheckingEditAccess])

  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
      !process.env.NEXT_PUBLIC_VERCEL_URL.includes('vercel.app')
    ) {
      console.log('[Posthog] Identifying user')
      posthog.identify(session.user.id, { email: session.user.email })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearSearchParams = () => {
    router.replace('/admin')
  }

  const searchParams = useSearchParams()
  const firstTime = searchParams.get('firstTime')
  useEffect(() => {
    if (firstTime === 'true') {
      posthog.capture('web-creation-dashboard-landing')
      setTimeout(() => {
        tour.drive()
        clearSearchParams()
      }, 2000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstTime])

  if (
    isLoadingWebs ||
    (selectedWebId && isLoadingListings) ||
    isLoadingAllowedWebs ||
    allowedWebs === null
  ) {
    return <Spinner />
  }

  if (allowedWebs?.length === 0) {
    redirect('/admin/welcome')
  }

  return <EditableList deleteListing={deleteListing} items={allowedListings} />
}
