import { useCallback, useState } from 'react'
import {
  Text,
  InputGroup,
  Input,
  InputRightElement,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Button,
} from '@chakra-ui/react'
import { Formik, Form, Field } from 'formik'
import { useReCaptcha } from 'next-recaptcha-v3'

import { fieldRequiredValidator } from '@helpers/formValidation'

const SignupForm = () => {
  const { executeRecaptcha } = useReCaptcha()
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState()

  const onSubmit = useCallback(
    async (data) => {
      const recaptchaToken = await executeRecaptcha('form_submit')

      const response = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: data.email, recaptchaToken }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.status === 201) {
        setIsSuccess(true)
      } else {
        setIsSuccess(false)

        const responseJson = await response.json()
        if (response.status === 400 || response.status === 403) {
          setErrorMessage(responseJson.error)
        }
      }
    },
    [executeRecaptcha],
  )

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
                    <FormHelperText fontWeight={600} textColor="rw.700">
                      Thanks! You're now on our mailing list 🙌
                    </FormHelperText>
                  )}
                  {errorMessage && (
                    <FormHelperText fontWeight={600} textColor="red.600">
                      {errorMessage}
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
                color="white"
                borderLeftRadius="none"
                borderRightRadius="md"
                border="none"
                cursor="pointer"
                fontWeight={600}
                isDisabled={!props.isValid}
                variant="rw"
              >
                Submit
              </Button>
            </InputRightElement>
          </InputGroup>
          <Text fontSize="10px" mt="0.25rem">
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="https://policies.google.com/privacy">Privacy Policy</a> and{' '}
            <a href="https://policies.google.com/terms">Terms of Service</a>{' '}
            apply.
          </Text>
        </Form>
      )}
    </Formik>
  )
}

export default SignupForm
