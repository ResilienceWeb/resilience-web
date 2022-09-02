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

import CategoryForm from './category-form'

type props = {
  onSubmit: (id: any) => void
  isOpen: boolean
  onClose: () => void
}

const NewCategoryDialog: React.FC<props> = ({ onSubmit, isOpen, onClose }) => {
  const { isMobile } = useAppContext()

  return (
    <Modal isCentered={!isMobile} isOpen={isOpen} onClose={onClose} size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create new category</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <CategoryForm onSubmit={onSubmit} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default memo(NewCategoryDialog)
