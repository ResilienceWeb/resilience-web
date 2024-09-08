'use client'
import { Box, Heading, useBreakpointValue, Flex } from '@chakra-ui/react'
import Layout from '@components/layout'

export default function About({ page, contentHtml }) {
  return (
    <Layout applyPostStyling>
      <Flex justifyContent="center">
        <Box
          maxWidth={useBreakpointValue({
            base: '90%',
            md: '650px',
          })}
          mb={8}
        >
          <Heading as="h1" mb={8}>
            {page.title}
          </Heading>
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </Box>
      </Flex>
    </Layout>
  )
}
