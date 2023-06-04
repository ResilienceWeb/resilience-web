import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useCallback } from 'react'
import {
  Flex,
  Box,
  Stack,
  Button,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { HiArrowLeft } from 'react-icons/hi'
import { useListing, useCreateListing, useUpdateListing } from '@hooks/listings'
import { useCategories } from '@hooks/categories'
import LayoutContainer from '@components/admin/layout-container'
import ListingForm from '@components/admin/listing-form'

export default function Listing() {
  const router = useRouter()
  const { slug } = router.query
  const { categories } = useCategories()
  const { mutate: updateListing } = useUpdateListing()
  const { mutate: createListing } = useCreateListing()

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  const handleSubmit = useCallback(
    (data) => {
      if (data.id) {
        updateListing(data)
      } else {
        // This case shouldn't happen on this page
        createListing(data)
      }
      goBack()
    },
    [createListing, updateListing, goBack],
  )

  const { listing, isLoading } = useListing(slug)

  if (!categories || !listing || isLoading) {
    return (
      <Flex height="100vh" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Flex>
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
        <Box
          px={{
            base: '4',
            md: '10',
          }}
          py={4}
          maxWidth="3xl"
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
            Back
          </Button>

          <Box mt={4}>
            <Box
              shadow="base"
              rounded={[null, 'md']}
              overflow={{ sm: 'hidden' }}
            >
              {listing.pending && (
                <Alert status="info" colorScheme="purple">
                  <AlertIcon />
                  This listing was submitted externally and is currently in
                  pending state. Check through the information below, and if
                  everything looks okay click Approve.
                </Alert>
              )}
              <Stack bg="white" spacing={6}>
                <ListingForm
                  categories={categories}
                  listing={listing}
                  handleSubmit={handleSubmit}
                />
              </Stack>
            </Box>
          </Box>
        </Box>
      </LayoutContainer>
    </>
  )
}
