import { memo } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react'

type props = {
  handleRemove: (id: any) => void
  isOpen: boolean
  onClose: () => void
}

const DeleteConfirmationialog: React.FC<props> = ({
  handleRemove,
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'md' }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Are you sure you want to delete this listing? It can't be recovered
          once deleted.
          <ModalFooter pr="0">
            <Button
              bg="gray.500"
              colorScheme="gray.500"
              mt={4}
              variant="solid"
              onClick={handleRemove}
              _hover={{ bg: 'gray.600' }}
            >
              Yes, delete
            </Button>
            <Button mt={4} ml={2} variant="rw" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default memo(DeleteConfirmationialog)
