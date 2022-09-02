import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { Flex, Box, Stack, Button, Spinner } from '@chakra-ui/react'
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
          <Box shadow="base" rounded={[null, 'md']} overflow={{ sm: 'hidden' }}>
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
  )
}
