import { memo } from 'react'
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
import { Category } from '@prisma/client'

import { fieldRequiredValidator } from '@helpers/formValidation'

const randomHexColorCode = () => {
  const n = (Math.random() * 0xfffff * 1000000).toString(16)
  return n.slice(0, 6)
}

const CategoryForm = ({
  category,
  onSubmit,
}: {
  category?: Category
  onSubmit: (data: any) => void
}) => {
  return (
    <Formik
      initialValues={{
        label: category?.label ?? '',
        color: category?.color ?? randomHexColorCode(),
      }}
      onSubmit={(values, actions) => {
        actions.setSubmitting(false)
        onSubmit(values)
      }}
    >
      {(props) => (
        <Form>
          <chakra.div mb={5}>
            <Field name="label" type="label" validate={fieldRequiredValidator}>
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.label}>
                  <FormLabel htmlFor="label">Category label</FormLabel>
                  <Input {...field} id="label" background="white" />
                  <FormErrorMessage>{form.errors.label}</FormErrorMessage>
                </FormControl>
              )}
            </Field>
          </chakra.div>
          <chakra.div mb={5}>
            <Field name="color">
              {({ _field, form }) => (
                <FormControl isInvalid={form.errors.color}>
                  <FormLabel htmlFor="color">Category color</FormLabel>
                  <HexColorPicker
                    color={form.values.color}
                    onChange={(value) => {
                      form.setFieldValue('color', value.substring(1))
                    }}
                  />
                  <FormErrorMessage>{form.errors.color}</FormErrorMessage>
                  <FormHelperText>
                    Note: the colour will be more faded than it looks here for
                    higher contrast
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
              isDisabled={!props.isValid}
              isLoading={props.isSubmitting}
              type="submit"
              _hover={{ bg: 'rw.900' }}
            >
              {category ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </Form>
      )}
    </Formik>
  )
}

export default memo(CategoryForm)
