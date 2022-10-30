import {
  Box,
  Heading,
  Stack,
  StackDivider,
  Center,
  Spinner,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import LayoutContainer from '@components/admin/layout-container'
import PermissionsList from '@components/admin/permissions-list'
import { useAllPermissions } from '@hooks/permissions'

export default function Permissions() {
  const { data: session, status: sessionStatus } = useSession()
  const { permissions, isLoading: isLoadingPermissions } = useAllPermissions()

  if (sessionStatus === 'loading' || isLoadingPermissions) {
    return (
      <LayoutContainer>
        <Center height="100%">
          <Spinner size="xl" />
        </Center>
      </LayoutContainer>
    )
  }

  console.log(permissions)

  if (!session || !session.user.admin || !permissions) return null

  return (
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
        <Stack spacing="4" divider={<StackDivider />}>
          <Heading>Permissions</Heading>
          <PermissionsList permissions={permissions} />
        </Stack>
      </Box>
    </LayoutContainer>
  )
}
