import { memo } from 'react'
import { Button, Stack, Flex } from '@chakra-ui/react'
import Diff from './Diff'
import useDeleteListingEdit from '@hooks/listings/useDeleteListingEdit'
import { useRouter } from 'next/navigation'

interface Props {
  listing: Listing
  editedListing: Listing
  handleSubmit: (data: any) => void
  webSlug: string
}

const ListingEditReview = ({
  listing,
  editedListing,
  handleSubmit,
  webSlug,
}: Props) => {
  const router = useRouter()
  const { deleteListingEdit } = useDeleteListingEdit()

  const handleReject = () => {
    deleteListingEdit({
      listingSlug: listing.slug,
      webSlug,
    })
    router.back()
  }

  return (
    <Stack bg="white" spacing={6}>
      <Diff
        label="Title"
        string1={listing.title}
        string2={editedListing.title}
      />

      <Diff
        label="Description"
        string1={listing.description}
        string2={editedListing.description}
      />

      <Diff
        label="Contact email for organisation"
        string1={listing.email}
        string2={editedListing.email}
      />

      <Diff
        label="Website"
        string1={listing.website}
        string2={editedListing.website}
      />

      <Diff
        label="Facebook"
        string1={listing.facebook}
        string2={editedListing.facebook}
      />

      <Diff
        label="Twitter"
        string1={listing.twitter}
        string2={editedListing.twitter}
      />

      <Diff
        label="Instagram"
        string1={listing.instagram}
        string2={editedListing.instagram}
      />

      <Flex justifyContent="flex-end" gap="1rem">
        <Button colorScheme="red" onClick={handleReject}>
          Reject
        </Button>
        <Button size="md" variant="rw" onClick={handleSubmit}>
          Accept changes
        </Button>
      </Flex>
    </Stack>
  )
}

export default memo(ListingEditReview)
