import { signIn, useSession } from 'next-auth/react'
import { memo, useEffect, useMemo } from 'react'
import { Center, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'

import LayoutContainer from '@components/admin/layout-container'
import EditableList from '@components/admin/editable-list'
import { useListings, useDeleteListing } from '@hooks/listings'
import { usePermissions } from '@hooks/permissions'
import { useIsOwnerOfCurrentWeb } from '@hooks/ownership'
import { useAppContext } from '@store/hooks'
import { useWebs } from '@hooks/webs'

const Admin = () => {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const { selectedWebId, selectedWebSlug } = useAppContext()
  const isOwnerOfCurrentWeb = useIsOwnerOfCurrentWeb()
  const { isPending: isLoadingWebs } = useWebs()

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

  if (!session) return null

  if (!isLoadingWebs && selectedWebSlug === null) {
    router.push('/admin/welcome')
  }

  if (isListingsPending || isPermissionsPending) {
    return (
      <LayoutContainer>
        <Center height="100%">
          <Spinner size="xl" />
        </Center>
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
