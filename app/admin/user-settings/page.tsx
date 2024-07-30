'use client'
import { useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Formik, Form, Field, FieldProps } from 'formik'
import {
  Box,
  Center,
  Spinner,
  Stack,
  Heading,
  chakra,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react'

import { useUpdateUser, useCurrentUser } from '@hooks/user'

export default function UserSettingsPage() {
  const { updateUser, isPending, isSuccess } = useUpdateUser()
  const { status: sessionStatus } = useSession()
  const { user } = useCurrentUser()

  const toast = useToast()
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Success',
        description: `User settings updated successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [isSuccess, toast])

  const onSubmit = useCallback(
    (data) => {
      updateUser({ name: data.name, subscribed: data.subscribed })
    },
    [updateUser],
  )

  if (!user || sessionStatus === 'loading') {
    return (
      <Center height="100%">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Stack spacing="1.5rem">
      <Box>
        <Heading>User settings</Heading>
        <Box
          shadow="base"
          rounded={[null, 'md']}
          overflow={{ sm: 'hidden' }}
          bg="white"
          padding="1rem"
          mt="1rem"
        >
          <Box maxWidth="400px">
            <Formik
              initialValues={{
                name: user.name ?? '',
                subscribed: user.subscribed ?? false,
              }}
              enableReinitialize
              onSubmit={onSubmit}
            >
              {(props) => {
                return (
                  <Form>
                    <chakra.div mb="2rem">
                      <Field name="name" type="text">
                        {({ field, form }: FieldProps) => (
                          <FormControl
                            isInvalid={Boolean(
                              form.errors.name && form.touched.name,
                            )}
                          >
                            <FormLabel
                              htmlFor="name"
                              fontSize="sm"
                              fontWeight="600"
                            >
                              Your name
                            </FormLabel>
                            <Input
                              {...field}
                              id="name"
                              fontSize="sm"
                              shadow="sm"
                              size="sm"
                              rounded="md"
                            />
                            <FormErrorMessage>
                              {form.errors.name?.toString()}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </chakra.div>

                    <chakra.div>
                      <Field name="subscribed">
                        {({ field, form }: FieldProps) => (
                          <FormControl
                            isInvalid={Boolean(
                              form.errors.subscribed && form.touched.subscribed,
                            )}
                          >
                            <Checkbox
                              isChecked={field.value}
                              id="subscribed"
                              onChange={field.onChange}
                              colorScheme="green"
                            >
                              Subscribed to the Resilience Web mailing list
                            </Checkbox>
                            <Text color="gray.500" fontSize="sm">
                              Check the box if you'd like to receive our
                              newsletter with news, platform updates and more.
                              You can unsubscribe anytime.
                            </Text>
                            <FormErrorMessage>
                              {form.errors.subscribed?.toString()}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </chakra.div>

                    <Button
                      mt={4}
                      variant="rw"
                      isDisabled={!props.isValid || !props.dirty}
                      isLoading={isPending}
                      type="submit"
                    >
                      Update
                    </Button>
                  </Form>
                )
              }}
            </Formik>
          </Box>
        </Box>
      </Box>
    </Stack>
  )
}
