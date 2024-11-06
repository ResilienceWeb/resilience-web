import { useMemo } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Stack,
  Checkbox,
  useCheckboxGroup,
  Button,
} from '@chakra-ui/react'

export default function AddTagToListingsDialog({
  tag,
  listings,
  onClose,
  onSubmit,
}) {
  const linkedListingsIds = useMemo(() => {
    return tag.listings.map((listing) => listing.id)
  }, [tag.listings])
  const { value, getCheckboxProps } = useCheckboxGroup({
    defaultValue: linkedListingsIds,
  })

  const handleSubmit = () => {
    const addedListingIds = value.map((v) => Number(v))
    const removedListingIds = linkedListingsIds.filter(
      (id) => !addedListingIds.includes(id),
    )
    onSubmit(addedListingIds, removedListingIds)
  }

  return (
    <Modal
      isCentered
      isOpen
      onClose={onClose}
      size={{ base: 'full', md: 'md' }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add tag to listings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={[1, 5]}>
            {listings.map((listing) => (
              <Checkbox
                key={listing.id}
                {...getCheckboxProps({ value: listing.id })}
              >
                {listing.title}
              </Checkbox>
            ))}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            mt={4}
            ml={2}
            variant="rw"
            type="submit"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
