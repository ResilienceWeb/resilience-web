import { memo } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'

import { useAppContext } from '@store/hooks'

import TagForm from './tag-form'

type props = {
  onSubmit: (id: any) => void
  isOpen: boolean
  onClose: () => void
}

const NewTagDialog: React.FC<props> = ({ onSubmit, isOpen, onClose }) => {
  const { isMobile } = useAppContext()

  return (
    <Modal isCentered={!isMobile} isOpen={isOpen} onClose={onClose} size="sm">
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
