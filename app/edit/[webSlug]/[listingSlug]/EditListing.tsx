'use client'
import { useCallback, useState } from 'react'
import {
  Box,
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
import useListingEdits from '@hooks/listings/useListingEdits'
import useWeb from '@hooks/webs/useWeb'
import Link from 'next/link'
import { PROTOCOL, REMOTE_HOSTNAME } from '@helpers/config'

export default function EditListing({ listing, webSlug }) {
  const { categories, isPending: isCategoriesLoading } = useCategoriesPublic({
    webSlug,
  })
  const { web } = useWeb({ webSlug })
  const { mutate: createListingEdit } = useCreateListingEdit()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { listingEdits, isPending: isLoadingEdits } = useListingEdits(
    listing.slug,
    webSlug,
  )

  const handleSubmit = useCallback(
    (data) => {
      data.webId = web?.id
      data.listingId = listing.id
      data.inactive = false
      data.relations = []
      createListingEdit(data)
      setTimeout(() => {
        setIsSubmitted(true)
        if (window) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 1000)
    },
    [web?.id, listing.id, createListingEdit],
  )

  if (isCategoriesLoading || isLoadingEdits) {
    return (
      <Layout>
        <Center height="50vh">
          <Spinner />
        </Center>
      </Layout>
    )
  }

  if (listingEdits && listingEdits.length > 0) {
    return (
      <Layout>
        <Box mt="3rem" maxWidth={{ base: '100%', md: '700px' }}>
          <Center flexDirection="column" gap={4}>
            <Alert status="info" rounded="md">
              <AlertIcon />
              This listing cannot be edited as there is already a suggested edit
              under review for it.
            </Alert>
            <Link
              href={`${PROTOCOL}://${webSlug}.${REMOTE_HOSTNAME}/${listing.slug}`}
            >
              <Button variant="rw">Go back to listing</Button>
            </Link>
          </Center>
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Box maxWidth={{ base: '100%', md: '700px' }}>
        {isSubmitted ? (
          <>
            <Heading as="h1" my="1rem">
              Thank you!
            </Heading>
            <Text>
              You have submitted your changes succesfully 🎉 <br /> Thank you
              for your contribution. It will be checked and hopefully approved
              by the admins of the <strong>{web?.title}</strong> web.
            </Text>
            <Link href={`${PROTOCOL}://${webSlug}.${REMOTE_HOSTNAME}`}>
              <Button mt="2rem" size="md" variant="rw">
                Go back to {web?.title} Resilience Web
              </Button>
            </Link>
          </>
        ) : (
          <Box
            my="2rem"
            shadow="base"
            rounded={[null, 'md']}
            overflow={{ sm: 'hidden' }}
          >
            <Alert status="info" colorScheme="blue">
              <AlertIcon />
              You are now editing a listing. Note that your changes will be
              submitted to the maintainers of the {web?.title} Resilience Web,
              who will review your suggested changes. Thank you for taking the
              keep information up to date. You're a ⭐!
            </Alert>
            <ListingFormSimplified
              listing={listing}
              categories={categories}
              handleSubmit={handleSubmit}
              isEditMode
            />
          </Box>
        )}
      </Box>
    </Layout>
  )
}
