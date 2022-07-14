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

import { useAppContext } from '@store/hooks'

import TagForm from './tag-form'

type props = {
    isOpen: boolean
    onSubmit: (id: any) => void
    onClose: () => void
    tag: Tag
}

const NewTagDialog: React.FC<props> = ({ isOpen, onSubmit, onClose, tag }) => {
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
