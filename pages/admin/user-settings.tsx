import { useCallback, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { NextSeo } from 'next-seo'
import { Formik, Form, Field, FieldProps } from 'formik'
import {
  Box,
  Center,
  Spinner,
  Stack,
  Heading,
  chakra,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react'

import LayoutContainer from '@components/admin/layout-container'
import { useUpdateUser, useCurrentUser } from '@hooks/user'

export default function UserSettings() {
  const { data: session, status: sessionStatus } = useSession()
  const { updateUser, isPending, isSuccess } = useUpdateUser()
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

  useEffect(() => {
    async function signInIfNeeded() {
      if (!session && !(sessionStatus === 'loading')) {
        await signIn()
      }
    }
    signInIfNeeded()
  }, [session, sessionStatus])

  const onSubmit = useCallback(
    (data) => {
      updateUser({ name: data.name })
    },
    [updateUser],
  )

  if (sessionStatus === 'loading') {
    return (
      <LayoutContainer>
        <Center height="100%">
          <Spinner size="xl" />
        </Center>
      </LayoutContainer>
    )
  }

  if (!session || !user) {
    return null
  }

  return (
    <>
      <NextSeo
        title="Admin | Resilience Web"
        openGraph={{
          title: 'Admin | Resilience Web',
        }}
      />
      <LayoutContainer>
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
      </LayoutContainer>
    </>
  )
}
