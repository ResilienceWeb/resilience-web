import { memo } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'

import CategoryForm from './category-form'

type props = {
  category: CategoryWithListings
  onSubmit: (id: any) => void
  isOpen: boolean
  onClose: () => void
  onDelete: (id: any) => void
}

const UpdateCategoryDialog: React.FC<props> = ({
  category,
  onSubmit,
  isOpen,
  onClose,
  onDelete,
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
        <ModalHeader>Update category</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <CategoryForm
            category={category}
            onDelete={onDelete}
            onSubmit={onSubmit}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default memo(UpdateCategoryDialog)
