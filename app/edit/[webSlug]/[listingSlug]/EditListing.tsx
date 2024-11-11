'use client'
import { useCallback } from 'react'
import {
  Box,
  Stack,
  Heading,
  Alert,
  AlertIcon,
  Text,
  Button,
  Center,
  Spinner,
} from '@chakra-ui/react'
import Layout from '@components/layout'
import ListingFormSimplified from '@components/admin/listing-form/ListingFormSimplified'
import useCategoriesPublic from '@hooks/categories/useCategoriesPublic'
import useCreateListingEdit from '@hooks/listings/useCreateListingEdit'
import useWeb from '@hooks/webs/useWeb'

export default function EditListing({ listing, webSlug }) {
  const { categories, isPending: isCategoriesLoading } = useCategoriesPublic({
    webSlug,
  })
  const { web } = useWeb({ webSlug })
  const { mutate: createListingEdit } = useCreateListingEdit()

  const handleSubmit = useCallback(
    (data) => {
      data.webId = web?.id
      data.inactive = false
      data.relations = []
      createListingEdit(data)
      setTimeout(() => {
        // setIsSubmitted(true)
        if (window) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 1000)
    },
    [web?.id, createListingEdit],
  )

  if (isCategoriesLoading) {
    return (
      <Layout>
        <Center height="50vh">
          <Spinner />
        </Center>
      </Layout>
    )
  }

  return (
    <Layout>
      <Box maxWidth={{ base: '100%', md: '700px' }}>
        <Box
          my="2rem"
          shadow="base"
          rounded={[null, 'md']}
          overflow={{ sm: 'hidden' }}
        >
          <ListingFormSimplified
            listing={listing}
            categories={categories}
            handleSubmit={handleSubmit}
          />
        </Box>
      </Box>
    </Layout>
  )
}
