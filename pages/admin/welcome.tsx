import { Box } from '@chakra-ui/react'

import LayoutContainer from '@components/admin/layout-container'
import WebCreation from '@components/admin/web-creation'

export default function Welcome() {
  return (
    <LayoutContainer>
      <Box px={{ base: '4', md: '10' }} py={4} maxWidth="2xl" mx="auto">
        <WebCreation />
      </Box>
    </LayoutContainer>
  )
}
