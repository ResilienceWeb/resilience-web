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
    chakra,
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
} from '@chakra-ui/react'
import { Formik, Form, Field } from 'formik'

import { useAppContext } from '@store/hooks'

type props = {
    onSubmit: (id: any) => void
    isOpen: boolean
    onClose: () => void
}

const NewCategoryDialog: React.FC<props> = ({ onSubmit, isOpen, onClose }) => {
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
                <ModalHeader>Create new category</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Formik
                        initialValues={{
                            label: '',
                            color: '5ce1e6',
                        }}
                        onSubmit={onSubmit}
                    >
                        {(props) => {
                            return (
                                <Form>
                                    <chakra.div mb={5}>
                                        <Field name="label" type="label">
                                            {({ field, form }) => (
                                                <FormControl
                                                    isInvalid={
                                                        form.errors.label
                                                    }
                                                >
                                                    <FormLabel htmlFor="label">
                                                        Category label
                                                    </FormLabel>
                                                    <Input
                                                        {...field}
                                                        id="label"
                                                        background="white"
                                                    />
                                                    <FormErrorMessage>
                                                        {form.errors.label}
                                                    </FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                    </chakra.div>
                                    <ModalFooter pr="0">
                                        <Button
                                            bg="rw.700"
                                            colorScheme="rw.700"
                                            mt={4}
                                            ml={2}
                                            variant="solid"
                                            disabled={!props.isValid}
                                            isLoading={props.isSubmitting}
                                            type="submit"
                                            _hover={{ bg: 'rw.900' }}
                                        >
                                            Create
                                        </Button>
                                    </ModalFooter>
                                </Form>
                            )
                        }}
                    </Formik>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default memo(NewCategoryDialog)
