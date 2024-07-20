import { signIn, useSession } from 'next-auth/react'
import { memo, useEffect, useMemo } from 'react'
import posthog from 'posthog-js'
import { Center, Spinner, Box } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { NextSeo } from 'next-seo'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

import LayoutContainer from '@components/admin/layout-container'
import EditableList from '@components/admin/editable-list'
import { useListings, useDeleteListing } from '@hooks/listings'
import { usePermissions } from '@hooks/permissions'
import { useIsOwnerOfCurrentWeb } from '@hooks/ownership'
import { useAppContext } from '@store/hooks'
import { useAllowedWebs } from '@hooks/webs'
import WebCreation from '@components/admin/web-creation'

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

const Admin = () => {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const { selectedWebId } = useAppContext()
  const isOwnerOfCurrentWeb = useIsOwnerOfCurrentWeb()
  const { allowedWebs, isLoadingWebs } = useAllowedWebs()

  useEffect(() => {
    if (
      session &&
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' &&
      !process.env.NEXT_PUBLIC_VERCEL_URL?.includes('vercel.app')
    ) {
      console.log('[Posthog] Identifying user')
      posthog.identify(session.user.id, { email: session.user.email })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus])

  const {
    listings,
    isPending: isListingsPending,
    isError: isListingsError,
  } = useListings()
  const { permissions, isPending: isPermissionsPending } = usePermissions()
  const { mutate: deleteListing } = useDeleteListing()

  useEffect(() => {
    if (!session && sessionStatus !== 'loading') {
      if (router.query.activate) {
        signIn('email', { email: router.query.activate })
      } else {
        signIn().catch((e) => console.error(e))
      }
    }
  }, [session, sessionStatus, router.query.activate])

  const allowedListings = useMemo(() => {
    if (!session || isPermissionsPending || isListingsPending) return null
    if (isOwnerOfCurrentWeb || session.user.admin) return listings

    if (permissions?.webIds?.includes(selectedWebId)) return listings

    return listings?.filter((listing) => {
      return permissions?.listingIds?.includes(listing.id)
    })
  }, [
    session,
    isPermissionsPending,
    isListingsPending,
    isOwnerOfCurrentWeb,
    listings,
    permissions?.webIds,
    permissions?.listingIds,
    selectedWebId,
  ])

  useEffect(() => {
    if (router.query.firstTime === 'true') {
      setTimeout(() => {
        driverObj.drive()
        router.replace('/admin', undefined, { shallow: true })
      }, 3000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.firstTime])

  if (sessionStatus === 'loading') {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (isListingsError) {
    console.error('[RW-Client] Error fetching listings')
  }

  if (!session) {
    return null
  }

  if (isLoadingWebs || isListingsPending || isPermissionsPending) {
    return (
      <LayoutContainer>
        <Center height="100%">
          <Spinner size="xl" />
        </Center>
      </LayoutContainer>
    )
  }

  if (!isLoadingWebs && allowedWebs.length === 0) {
    return (
      <LayoutContainer>
        <Box px={{ base: '4', md: '10' }} py={4} maxWidth="2xl" mx="auto">
          <WebCreation />
        </Box>
      </LayoutContainer>
    )
  }

  return (
    <>
      <NextSeo
        title="Admin | Resilience Web"
        openGraph={{
          title: 'Admin | Resilience Web',
        }}
      />
      <LayoutContainer>
        <EditableList
          deleteListing={deleteListing}
          isAdmin={session.user.admin}
          items={allowedListings}
        />
      </LayoutContainer>
    </>
  )
}

Admin.auth = true

export default memo(Admin)
