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
  Tooltip,
} from '@chakra-ui/react'
import { Formik, Form, Field } from 'formik'
import { HexColorPicker } from 'react-colorful'

import { fieldRequiredValidator } from '@helpers/formValidation'

const randomHexColorCode = () => {
  const n = (Math.random() * 0xfffff * 1000000).toString(16)
  return n.slice(0, 6)
}

const CategoryForm = ({
  category,
  onDelete,
  onSubmit,
}: {
  category?: CategoryWithListings
  onDelete?: (data: any) => void
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
                    Please avoid using white as the text on it will not be
                    readable in certain parts of the website.
                  </FormHelperText>
                </FormControl>
              )}
            </Field>
          </chakra.div>
          <ModalFooter
            pr="0"
            pl="0"
            display="flex"
            justifyContent="flex-end"
            alignItems="flex-end"
          >
            {category && (
              <Tooltip
                isDisabled={category?.listings?.length === 0}
                borderRadius="md"
                label="To delete this category, first ensure there are no listings associated with it"
              >
                <Button
                  colorScheme="red"
                  isDisabled={category?.listings?.length > 0}
                  opacity="0.85"
                  onClick={onDelete}
                >
                  Remove
                </Button>
              </Tooltip>
            )}

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

            {/* {category?.listings.length > 0 && (
              <Text>
                To delete this category, first ensure there are no listings
                associated with it
              </Text>
            )} */}
          </ModalFooter>
        </Form>
      )}
    </Formik>
  )
}

export default memo(CategoryForm)
