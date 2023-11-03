import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import { NextSeo } from 'next-seo'
import { Formik, Form, Field, FieldProps } from 'formik'
import {
  Box,
  Center,
  Spinner,
  Checkbox,
  Stack,
  StackDivider,
  Heading,
  chakra,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Text,
  useToast,
} from '@chakra-ui/react'

import LayoutContainer from '@components/admin/layout-container'
import ImageUpload from '@components/admin/listing-form/ImageUpload'
import { usePermissions } from '@hooks/permissions'
import { useWeb, useUpdateWeb } from '@hooks/webs'
import { useOwnerships, useIsOwnerOfCurrentWeb } from '@hooks/ownership'
import { useAppContext } from '@store/hooks'

export default function Settings() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const isOwnerOfCurrentWeb = useIsOwnerOfCurrentWeb()
  const { isLoading: isLoadingPermissions } = usePermissions()
  const { selectedWebSlug } = useAppContext()
  const { web: webData } = useWeb(selectedWebSlug)
  const { updateWeb, isLoading, isSuccess } = useUpdateWeb()

  const { ownerships } = useOwnerships()

  const toast = useToast()
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Success',
        description: `Web updated successfully`,
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
    void signInIfNeeded()
  }, [session, sessionStatus])

  const onSubmit = useCallback(
    (data) => {
      updateWeb({
        ...data,
        slug: webData?.slug,
      })
    },
    [updateWeb, webData?.slug],
  )

  if (sessionStatus === 'loading' || isLoadingPermissions) {
    return (
      <LayoutContainer>
        <Center height="100%">
          <Spinner size="xl" />
        </Center>
      </LayoutContainer>
    )
  }

  if (!session) return null

  if (isOwnerOfCurrentWeb === false) {
    void router.push('/admin')
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
        <Box px={{ base: '4', md: '10' }} py={4} maxWidth="4xl" mx="auto">
          <Stack spacing="1.5rem">
            <Box>
              <Heading>Web settings</Heading>
              <Text>This page is only accessible to web owners.</Text>
              <Box
                shadow="base"
                rounded={[null, 'md']}
                overflow={{ sm: 'hidden' }}
                bg="white"
                padding="1rem"
                mt="1rem"
              >
                <Formik
                  initialValues={{
                    published: Boolean(webData?.published),
                    image: webData?.image,
                  }}
                  enableReinitialize
                  onSubmit={onSubmit}
                >
                  {(props) => {
                    return (
                      <Form>
                        <chakra.div mb="2rem">
                          <Field name="published">
                            {({ field, form }: FieldProps) => {
                              return (
                                <FormControl
                                  isInvalid={Boolean(
                                    form.errors.published &&
                                      form.touched.published,
                                  )}
                                >
                                  <Checkbox
                                    isChecked={field.value}
                                    id="published"
                                    onChange={field.onChange}
                                  >
                                    Published
                                  </Checkbox>
                                  <FormErrorMessage>
                                    {form.errors.published?.toString()}
                                  </FormErrorMessage>
                                  <FormHelperText>
                                    Is this web ready to be publicly visible on
                                    the Resilience Web homepage?
                                  </FormHelperText>
                                </FormControl>
                              )
                            }}
                          </Field>
                        </chakra.div>

                        <Field name="image">
                          {({ field, form }: FieldProps) => (
                            <ImageUpload
                              field={field}
                              form={form}
                              formProps={props}
                              helperText={`This should be a picture that best represents ${webData?.title}`}
                            />
                          )}
                        </Field>

                        <Button
                          bg="rw.700"
                          colorScheme="rw.700"
                          mt={4}
                          variant="solid"
                          isDisabled={!props.isValid || !props.dirty}
                          isLoading={isLoading}
                          type="submit"
                          _hover={{ bg: 'rw.900' }}
                        >
                          Update
                        </Button>
                      </Form>
                    )
                  }}
                </Formik>
              </Box>
            </Box>

            {ownerships?.length > 0 && (
              <Box>
                <Heading>Owners</Heading>
                <Text>
                  List of people who have full access to the{' '}
                  <b>{webData?.title}</b> web
                </Text>
                <Box
                  shadow="base"
                  rounded={[null, 'md']}
                  overflow={{ sm: 'hidden' }}
                  bg="white"
                  padding="1rem"
                  mt="1rem"
                >
                  <Stack spacing="1rem" divider={<StackDivider />}>
                    {ownerships?.map((ownership) => (
                      <Text key={ownership.id}>
                        {ownership.user.email}
                        {session?.user?.id === ownership.user.id ? (
                          <b> &nbsp;(You)</b>
                        ) : (
                          ''
                        )}
                      </Text>
                    ))}
                  </Stack>
                </Box>
              </Box>
            )}
          </Stack>
        </Box>
      </LayoutContainer>
    </>
  )
}
