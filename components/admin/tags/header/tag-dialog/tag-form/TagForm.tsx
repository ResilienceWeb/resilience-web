import {
  ModalFooter,
  Button,
  chakra,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from '@chakra-ui/react'
import { Formik, Form, Field } from 'formik'
import { Tag } from '@prisma/client'

import { fieldRequiredValidator } from '@helpers/formValidation'

const TagForm = ({
  onSubmit,
  tag,
}: {
  onSubmit: (data: any) => void
  tag?: Tag
}) => {
  return (
    <Formik
      initialValues={{ label: tag?.label ?? '' }}
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
                  <FormLabel htmlFor="label">Tag label</FormLabel>
                  <Input {...field} id="label" background="white" />
                  <FormErrorMessage>{form.errors.label}</FormErrorMessage>
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
              {tag ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </Form>
      )}
    </Formik>
  )
}

export default TagForm
