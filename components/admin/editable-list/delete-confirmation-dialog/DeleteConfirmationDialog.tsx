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

import { useAppContext } from '@store/hooks'

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
  const { isMobile } = useAppContext()

  return (
    <Modal isCentered={!isMobile} isOpen={isOpen} onClose={onClose} size="sm">
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
            <Button
              bg="rw.700"
              colorScheme="rw.700"
              mt={4}
              ml={2}
              variant="solid"
              onClick={onClose}
              _hover={{ bg: 'rw.900' }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default memo(DeleteConfirmationialog)
