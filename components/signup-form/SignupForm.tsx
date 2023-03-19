import { useCallback, useState } from 'react'
import {
  InputGroup,
  Input,
  InputRightElement,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Button,
} from '@chakra-ui/react'
import { Formik, Form, Field } from 'formik'

import { fieldRequiredValidator } from '@helpers/formValidation'

const SignupForm = () => {
  const [isSuccess, setIsSuccess] = useState(false)

  const onSubmit = useCallback(async (data) => {
    const response = await fetch('/api/newsletter-subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: data.email }),
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.status === 201) {
      setIsSuccess(true)
    } else {
      setIsSuccess(false)
    }
  }, [])

  return (
    <Formik
      initialValues={{
        email: '',
      }}
      onSubmit={(values, actions) => {
        actions.setSubmitting(false)
        void onSubmit(values)
      }}
    >
      {(props) => (
        <Form>
          <InputGroup size="md">
            <Field name="email" validate={fieldRequiredValidator}>
              {({ field, form }) => (
                <FormControl isInvalid={form.errors.email}>
                  <Input
                    {...field}
                    type="email"
                    id="email"
                    placeholder="Your email address"
                    background="white"
                    textColor="gray.900"
                    width="22rem"
                    autoCapitalize="off"
                    autoCorrect="off"
                    _placeholder={{ color: 'gray.700' }}
                  />
                  <FormErrorMessage>
                    You forgot to enter your email :)
                  </FormErrorMessage>
                  {isSuccess && (
                    <FormHelperText fontWeight="700" textColor="rw.700">
                      You have subscribed successfully 🎉
                    </FormHelperText>
                  )}
                </FormControl>
              )}
            </Field>
            <InputRightElement width="8.5rem" justifyContent="flex-end">
              <Button
                type="submit"
                h="100%"
                size="md"
                bg="rw.700"
                colorScheme="rw.700"
                color="white"
                borderLeftRadius="none"
                borderRightRadius="md"
                border="none"
                cursor="pointer"
                fontWeight={600}
                isDisabled={!props.isValid}
                _hover={{ bg: 'rw.900' }}
              >
                Submit
              </Button>
            </InputRightElement>
          </InputGroup>
        </Form>
      )}
    </Formik>
  )
}

export default SignupForm
