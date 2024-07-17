import { useEffect } from 'react'
import { Box, Center, Spinner } from '@chakra-ui/react'
import { signIn, useSession } from 'next-auth/react'

import LayoutContainer from '@components/admin/layout-container'
import WebCreation from '@components/admin/web-creation'

export default function Welcome() {
  const { data: session, status: sessionStatus } = useSession()

  useEffect(() => {
    async function signInIfNeeded() {
      if (!session && !(sessionStatus === 'loading')) {
        await signIn()
      }
    }
    signInIfNeeded()
  }, [session, sessionStatus])

  if (sessionStatus === 'loading') {
    return (
      <LayoutContainer>
        <Center height="100%">
          <Spinner size="xl" />
        </Center>
      </LayoutContainer>
    )
  }

  if (!session) return null

  return (
    <LayoutContainer>
      <Box px={{ base: '4', md: '10' }} py={4} maxWidth="2xl" mx="auto">
        <WebCreation />
      </Box>
    </LayoutContainer>
  )
}
