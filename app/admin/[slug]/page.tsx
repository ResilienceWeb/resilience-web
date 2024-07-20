'use client'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Stack,
  Button,
  Spinner,
  Center,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { HiArrowLeft } from 'react-icons/hi'
import { useListing, useUpdateListing } from '@hooks/listings'
import { useCategories } from '@hooks/categories'
import ListingForm from '@components/admin/listing-form'

export default function ListingPage({ params }) {
  const router = useRouter()
  const slug = params.slug
  const { categories } = useCategories()
  const { mutate: updateListing } = useUpdateListing()

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  const handleSubmit = useCallback(
    (data) => {
      if (data.id) {
        updateListing(data)
      }
      goBack()
    },
    [updateListing, goBack],
  )

  const { listing, isPending } = useListing(slug)

  if (!categories || !listing || isPending) {
    return (
      <Center height="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
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
          {listing.pending && (
            <Alert status="info" colorScheme="purple">
              <AlertIcon />
              This listing was submitted externally and is currently in pending
              state. Check through the information below, and if everything
              looks okay click Approve.
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
  )
}
