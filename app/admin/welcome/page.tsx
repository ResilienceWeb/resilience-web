'use client'
import { Box } from '@chakra-ui/react'
import WebCreation from '@components/admin/web-creation'

export default function WelcomePage() {
  return (
    <Box px={{ base: '4', md: '10' }} py={4} maxWidth="2xl" mx="auto">
      <WebCreation />
    </Box>
  )
}
