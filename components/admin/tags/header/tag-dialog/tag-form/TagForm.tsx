import {
  ModalFooter,
  Button,
  chakra,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Tooltip,
} from '@chakra-ui/react'
import { Formik, Form, Field } from 'formik'

import { fieldRequiredValidator } from '@helpers/formValidation'

const TagForm = ({
  onSubmit,
  onDelete,
  tag,
}: {
  onSubmit: (data: any) => void
  onDelete?: (data: any) => void
  tag?: TagWithListings
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
          <ModalFooter
            pr="0"
            pl="0"
            display="flex"
            justifyContent="flex-end"
            alignItems="flex-end"
          >
            {tag && (
              <Tooltip
                isDisabled={tag?.listings?.length === 0}
                borderRadius="md"
                label="To delete this tag, first ensure there are no listings associated with it"
              >
                <Button
                  colorScheme="red"
                  isDisabled={tag?.listings?.length > 0}
                  opacity="0.85"
                  onClick={onDelete}
                >
                  Remove
                </Button>
              </Tooltip>
            )}
            <Button
              mt={4}
              ml={2}
              variant="rw"
              isDisabled={!props.isValid}
              isLoading={props.isSubmitting}
              type="submit"
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
