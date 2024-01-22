import { NextSeo } from 'next-seo'
import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Flex,
  Badge,
  Heading,
  Center,
  Spinner,
  Text,
  Link,
  Button,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import LayoutContainer from '@components/admin/layout-container'
import PermissionsTable from '@components/admin/permissions-table'
import { useWeb } from '@hooks/webs'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'
import { HiArrowLeft } from 'react-icons/hi'

export default function WebOverview() {
  const router = useRouter()
  const { webSlug } = router.query
  const { data: session, status: sessionStatus } = useSession()
  const { web, isPending: isLoadingWeb } = useWeb({
    webSlug,
    withAdminInfo: true,
  })

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  const decoratedOwnerships = useMemo(() => {
    if (!web || !web.ownerships) {
      return []
    }

    return web.ownerships
      .filter((ownership) => !ownership.user?.admin)
      .map((ownership) => ({ ...ownership, owner: true }))
  }, [web])

  const permissionsForCurrentWebWithoutOwners = useMemo(() => {
    if (!web || !web.ownerships || !web.permissions) {
      return []
    }

    const filteredPermissions = []
    const ownershipsEmails = web.ownerships?.map((o) => o.user?.email)
    web.permissions?.map((permission) => {
      if (!ownershipsEmails?.includes(permission.user.email)) {
        filteredPermissions.push(permission)
      }
    })

    return filteredPermissions
  }, [web])

  if (sessionStatus === 'loading' || isLoadingWeb) {
    return (
      <LayoutContainer>
        <Center height="100%">
          <Spinner size="xl" />
        </Center>
      </LayoutContainer>
    )
  }

  if (!session || !session.user.admin) return null

  console.log({ web })

  return (
    <>
      <NextSeo
        title="Admin | Resilience Web"
        openGraph={{
          title: 'Admin | Resilience Web',
        }}
      />
      <LayoutContainer>
        <Box
          px={{
            base: '4',
            md: '10',
          }}
          py={4}
          maxWidth="5xl"
          mx="auto"
        >
          <Button
            leftIcon={<HiArrowLeft />}
            name="Back"
            mb={2}
            ml={2}
            onClick={goBack}
            variant="link"
            color="gray.700"
          >
            Back to main list
          </Button>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading mb="1rem">{web.title}</Heading>
            {web.published ? (
              <Badge colorScheme="green" fontSize="lg">
                Published
              </Badge>
            ) : (
              <Badge fontSize="lg">Private</Badge>
            )}
          </Flex>
          <Link
            href={`${PROTOCOL}://${web.slug}.${REMOTE_HOSTNAME}`}
            target="_blank"
            fontWeight={600}
            color="rw.900"
          >
            {`${web.slug}.${REMOTE_HOSTNAME}`}
          </Link>
          <Text mt="1rem">
            <strong>{web.listings.length}</strong> listings
          </Text>

          {(web.permissions?.length > 0 || decoratedOwnerships?.length > 0) && (
            <Box mt="2rem">
              <Heading as="h3" fontSize="1.75rem" mb="0.5rem">
                Team
              </Heading>
              <PermissionsTable
                permissions={[
                  ...decoratedOwnerships,
                  ...permissionsForCurrentWebWithoutOwners,
                ]}
              />
            </Box>
          )}
        </Box>
      </LayoutContainer>
    </>
  )
}
