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
  onSubmit: (id: any) => void
  isOpen: boolean
  onClose: () => void
}

const NewTagDialog: React.FC<props> = ({ onSubmit, isOpen, onClose }) => {
  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'md' }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create new tag</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TagForm onSubmit={onSubmit} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default memo(NewTagDialog)
