import { memo } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'

import TagForm from './tag-form'

type props = {
  isOpen: boolean
  onSubmit: (id: any) => void
  onClose: () => void
  onDelete: (id: any) => void
  tag: TagWithListings
}

const UpdateTagDialog: React.FC<props> = ({
  isOpen,
  onSubmit,
  onClose,
  onDelete,
  tag,
}) => {
  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'sm' }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update tag</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TagForm onSubmit={onSubmit} onDelete={onDelete} tag={tag} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default memo(UpdateTagDialog)
