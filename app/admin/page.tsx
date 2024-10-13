'use client'
import { useSearchParams, useRouter, redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo } from 'react'
import posthog from 'posthog-js'
import { Center, Spinner } from '@chakra-ui/react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

import EditableList from '@components/admin/editable-list'
import useAllowedWebs from '@hooks/webs/useAllowedWebs'
import useListings from '@hooks/listings/useListings'
import useDeleteListing from '@hooks/listings/useDeleteListing'
import usePermissions from '@hooks/permissions/usePermissions'
import useIsOwnerOfCurrentWeb from '@hooks/ownership/useIsOwnerOfCurrentWeb'
import { useAppContext } from '@store/hooks'

const driverObj = driver({
  showProgress: true,
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
          'Upload a cover image for your web and publish it when it is ready.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      popover: {
        title: 'We will let you crack on now 😊',
        description:
          "If you need any support along the way, don't hesitate to get in touch at info@resilienceweb.org.uk",
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

  console.log('AdminPage', allowedWebs)

  const allowedListings = useMemo(() => {
    if (isLoadingListings || isLoadingPermissions) return null
    if (isOwnerOfCurrentWeb || session.user.admin) return listings

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
      }, 3000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstTime])

  if (
    isLoadingWebs ||
    isLoadingListings ||
    isLoadingAllowedWebs ||
    allowedWebs === null
  ) {
    return (
      <Center height="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (allowedWebs.length === 0) {
    redirect('/admin/welcome')
  }

  return (
    <EditableList
      deleteListing={deleteListing}
      isAdmin={session?.user.admin}
      items={allowedListings}
    />
  )
}
