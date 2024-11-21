'use client'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import NextLink from 'next/link'
import {
  Box,
  Button,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Link,
  Text,
} from '@chakra-ui/react'
import { HiArrowLeft } from 'react-icons/hi'
import useCategories from '@hooks/categories/useCategories'
import useListing from '@hooks/listings/useListing'
import useApplyListingEdit from '@hooks/listings/useApplyListingEdit'
import useListingEdits from '@hooks/listings/useListingEdits'
import { useAppContext } from '@store/hooks'
import ListingEditReview from '@components/admin/listing-form/listing-edit-review'

export default function ListingEditsPage({ params }) {
  const router = useRouter()
  const slug = params.slug
  const { categories } = useCategories()
  const { mutate: applyListingEdit } = useApplyListingEdit()
  const { selectedWebSlug } = useAppContext()

  const { listing, isPending: isLoadingListing } = useListing(slug)
  const { listingEdits, isPending: isLoadingListingEdits } = useListingEdits(
    slug,
    selectedWebSlug,
  )

  const goBack = useCallback(() => {
    router.back()
  }, [router])

  const navigateToListing = useCallback(() => {
    router.push(`admin/${slug}`)
  }, [router, slug])

  const handleSubmit = useCallback(() => {
    applyListingEdit({
      listingId: listing?.id,
      listingEditId: listingEdits[0]?.id,
    })
    navigateToListing()
  }, [applyListingEdit, listing?.id, listingEdits, navigateToListing])

  if (!categories || !listing || isLoadingListing || isLoadingListingEdits) {
    return (
      <Center height="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (!listingEdits || listingEdits.length === 0) {
    return (
      <Box
        px={{
          base: '4',
          md: '10',
        }}
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

        <Center flexDirection="column" gap={4}>
          <Alert status="info" rounded="md">
            <AlertIcon />
            No pending edits found for this listing.
          </Alert>
          <Button onClick={goBack} variant="rw">
            Go back to listings
          </Button>
        </Center>
      </Box>
    )
  }

  const editedListing = listingEdits[0]

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
        <Text mb="1rem" fontSize="0.875rem">
          You can view this listing at{' '}
          <Link
            as={NextLink}
            href={`https://${selectedWebSlug}.resilienceweb.org.uk/${slug}`}
            target="_blank"
          >
            {selectedWebSlug}.resilienceweb.org.uk/{slug}
          </Link>
        </Text>
        <Box overflow={{ sm: 'hidden' }}>
          <Alert status="info" rounded="md" colorScheme="purple" mb="2rem">
            <AlertIcon />
            The changes highlighted below were submitted externally by X. Check
            through them, and if everything looks okay click Accept changes. If
            the changes are incorrect or low quality, click Reject changes.
          </Alert>
          <ListingEditReview
            categories={categories}
            listing={listing}
            editedListing={editedListing}
            handleSubmit={handleSubmit}
          />
        </Box>
      </Box>
    </Box>
  )
}
