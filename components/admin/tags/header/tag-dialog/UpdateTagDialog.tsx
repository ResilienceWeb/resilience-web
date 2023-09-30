import { memo } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import { Tag } from '@prisma/client'

import TagForm from './tag-form'

type props = {
  isOpen: boolean
  onSubmit: (id: any) => void
  onClose: () => void
  tag: Tag
}

const NewTagDialog: React.FC<props> = ({ isOpen, onSubmit, onClose, tag }) => {
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
          <TagForm onSubmit={onSubmit} tag={tag} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default memo(NewTagDialog)
