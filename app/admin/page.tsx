'use client'

import { useEffect, useMemo } from 'react'
import { useSearchParams, useRouter, redirect } from 'next/navigation'
import { useAppContext } from '@store/hooks'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import posthog from 'posthog-js'
import { useSession } from '@auth-client'
import EditableList from '@components/admin/editable-list'
import { Spinner } from '@components/ui/spinner'
import useDeleteListing from '@hooks/listings/useDeleteListing'
import useListings from '@hooks/listings/useListings'
import useIsOwnerOfCurrentWeb from '@hooks/ownership/useIsOwnerOfCurrentWeb'
import usePermissions from '@hooks/permissions/usePermissions'
import useAllowedWebs from '@hooks/webs/useAllowedWebs'

const driverObj = driver({
  showProgress: true,
  allowClose: true,
  steps: [
    {
      element: '[data-tourid=new-listing]',
      popover: {
        title: 'Create your first listing 🙌',
        description:
          'Try to create your first listing here. Feel free to experiment, anything can be edited or deleted.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tourid=nav-categories]',
      popover: {
        title: 'Edit categories & tags 🏷️',
        description:
          'All the categories and tags are customisable and you can edit them here.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tourid=nav-team]',
      popover: {
        title: 'Manage your team',
        description: 'Invite collaborators and manage your team here.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tourid=nav-websettings]',
      popover: {
        title: 'Edit web settings ⚙️',
        description:
          'If you are an owner, you can also edit web settings on the left hand side. As an editor, you can only edit listings and categories.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      popover: {
        title: 'We will let you crack on now 😊',
        description:
          "If you need any support along the way, don't hesitate to get in touch via the Get in touch button at the top",
      },
    },
  ],
})

export default function AdminPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { selectedWebId } = useAppContext()
  const isOwnerOfCurrentWeb = useIsOwnerOfCurrentWeb()

  const {
    allowedWebs,
    isLoadingWebs,
    isLoading: isLoadingAllowedWebs,
  } = useAllowedWebs()
  const { listings, isPending: isLoadingListings } = useListings()
  const { permissions, isPending: isLoadingPermissions } = usePermissions()
  const { mutate: deleteListing } = useDeleteListing()

  const allowedListings = useMemo(() => {
    if (isLoadingListings || isLoadingPermissions) return null
    if (isOwnerOfCurrentWeb || session.user.role === 'admin') return listings

    if (permissions?.webIds?.includes(selectedWebId)) return listings

    return listings?.filter((listing) => {
      return permissions?.listingIds?.includes(listing.id)
    })
  }, [
    session,
    isLoadingPermissions,
    isLoadingListings,
    isOwnerOfCurrentWeb,
    listings,
    permissions?.webIds,
    permissions?.listingIds,
    selectedWebId,
  ])

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
        driverObj.drive()
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

  return (
    <EditableList
      deleteListing={deleteListing}
      isAdmin={session?.user.role === 'admin'}
      items={allowedListings}
    />
  )
}
