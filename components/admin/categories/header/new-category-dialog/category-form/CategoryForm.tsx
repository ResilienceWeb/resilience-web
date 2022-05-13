import {
    ModalFooter,
    Button,
    chakra,
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    FormHelperText,
} from '@chakra-ui/react'
import { Formik, Form, Field } from 'formik'
import { HexColorPicker } from 'react-colorful'

import { fieldRequiredValidator } from '@helpers/formValidation'

const CategoryForm = ({ onSubmit }) => {
    return (
        <Formik
            initialValues={{
                label: '',
                color: '',
            }}
            onSubmit={(values, actions) => {
                actions.setSubmitting(false)
                onSubmit(values)
            }}
        >
            {(props) => (
                <Form>
                    <chakra.div mb={5}>
                        <Field
                            name="label"
                            type="label"
                            validate={fieldRequiredValidator}
                        >
                            {({ field, form }) => (
                                <FormControl isInvalid={form.errors.label}>
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
                    <chakra.div mb={5}>
                        <Field name="color">
                            {({ field, form }) => (
                                <FormControl isInvalid={form.errors.color}>
                                    <FormLabel htmlFor="color">
                                        Category color
                                    </FormLabel>
                                    <HexColorPicker
                                        color={form.values.color}
                                        onChange={(value) => {
                                            form.setFieldValue(
                                                'color',
                                                value.substring(1),
                                            )
                                        }}
                                    />
                                    <FormErrorMessage>
                                        {form.errors.color}
                                    </FormErrorMessage>
                                    <FormHelperText>
                                        Note: the colour will be more faded than
                                        it looks here for higher contrast
                                    </FormHelperText>
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
            )}
        </Formik>
    )
}

export default CategoryForm

