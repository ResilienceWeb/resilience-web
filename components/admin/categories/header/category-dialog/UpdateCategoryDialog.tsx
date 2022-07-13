import { memo } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import { Category } from '@prisma/client'

import { useAppContext } from '@store/hooks'

import CategoryForm from './category-form'

type props = {
    category: Category
    onSubmit: (id: any) => void
    isOpen: boolean
    onClose: () => void
}

const UpdateCategoryDialog: React.FC<props> = ({
    category,
    onSubmit,
    isOpen,
    onClose,
}) => {
    const { isMobile } = useAppContext()

    return (
        <Modal
            isCentered={!isMobile}
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Update category</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <CategoryForm category={category} onSubmit={onSubmit} />
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default memo(UpdateCategoryDialog)
