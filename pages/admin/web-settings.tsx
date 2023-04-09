import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
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
  useToast,
} from '@chakra-ui/react'

import LayoutContainer from '@components/admin/layout-container'
import ImageUpload from '@components/admin/listing-form/ImageUpload'
import { useHasPermissionForCurrentWeb } from '@hooks/permissions'
import { useWeb, useUpdateWeb } from '@hooks/webs'
import { useAppContext } from '@store/hooks'

export default function Settings() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const hasPermissionForCurrentWeb = useHasPermissionForCurrentWeb()
  const { selectedWebSlug } = useAppContext()
  const { web: webData } = useWeb(selectedWebSlug)
  const { updateWeb, isLoading, isSuccess } = useUpdateWeb()

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
        slug: webData.slug,
      })
    },
    [updateWeb, webData?.slug],
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

  if (!session) return null

  if (!hasPermissionForCurrentWeb) {
    void router.push('/admin')
  }

  return (
    <LayoutContainer>
      <Box px={{ base: '4', md: '10' }} py={4} maxWidth="3xl" mx="auto">
        <Stack spacing="4" divider={<StackDivider />}>
          <Heading>Web settings</Heading>
          <Box
            shadow="base"
            rounded={[null, 'md']}
            overflow={{ sm: 'hidden' }}
            bg="white"
            padding="1rem"
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
                                form.errors.published && form.touched.published,
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
                                Is this web ready to be publicly visible on the
                                website homepage?
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
        </Stack>
      </Box>
    </LayoutContainer>
  )
}

