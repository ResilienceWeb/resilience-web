'use client'
import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Formik, Form, Field, FieldProps } from 'formik'
import {
  Box,
  Center,
  Spinner,
  Checkbox,
  Stack,
  Heading,
  chakra,
  Button,
  FormLabel,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Textarea,
  Text,
  Link,
  useToast,
} from '@chakra-ui/react'

import ImageUpload from '@components/admin/listing-form/ImageUpload'
import { usePermissions } from '@hooks/permissions'
import { useWeb, useUpdateWeb } from '@hooks/webs'
import { useIsOwnerOfCurrentWeb } from '@hooks/ownership'
import { useAppContext } from '@store/hooks'

export default function WebSettingsPage() {
  // const router = useRouter()
  // const isOwnerOfCurrentWeb = useIsOwnerOfCurrentWeb()
  const { isPending: isPendingPermissions } = usePermissions()
  const { selectedWebSlug } = useAppContext()
  const { web: webData } = useWeb({ webSlug: selectedWebSlug })
  const { updateWeb, isPending, isSuccess } = useUpdateWeb()

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

  const onSubmit = useCallback(
    (data) => {
      updateWeb({
        ...data,
        slug: webData?.slug,
      })
    },
    [updateWeb, webData?.slug],
  )

  if (isPendingPermissions) {
    return (
      <Center height="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  // if (isOwnerOfCurrentWeb === false) {
  //   router.push('/admin')
  // }

  return (
    <Stack spacing="1.5rem">
      <Box>
        <Heading>Web settings</Heading>
        <Text color="gray.600">
          This page is only accessible to web owners.
        </Text>
        <Box
          shadow="base"
          rounded={[null, 'md']}
          overflow={{ sm: 'hidden' }}
          bg="white"
          padding="1rem"
          my="1rem"
        >
          <Formik
            initialValues={{
              published: Boolean(webData?.published),
              description: webData?.description ?? '',
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
                              colorScheme="green"
                              disabled
                            >
                              Published
                            </Checkbox>
                            <FormErrorMessage>
                              {form.errors.published?.toString()}
                            </FormErrorMessage>
                            {field.value === false && (
                              <FormHelperText>
                                We don't allow self-publishing webs yet. When
                                your web is ready to share with the world,
                                please get in touch at{' '}
                                <Link
                                  href="mailto:info@resilienceweb.org.uk"
                                  fontWeight="600"
                                  _hover={{
                                    color: 'gray.700',
                                  }}
                                >
                                  info@resilienceweb.org.uk
                                </Link>{' '}
                                and we'll review and publish it for you. Please
                                make sure your web has at least 10 listings with
                                complete information and images, and that your
                                web has a cover image uploaded below.
                              </FormHelperText>
                            )}
                          </FormControl>
                        )
                      }}
                    </Field>
                  </chakra.div>

                  <chakra.div mb="2rem">
                    <Field name="description" type="text">
                      {({ field, form }: FieldProps) => (
                        <FormControl
                          isInvalid={Boolean(
                            form.errors.description && form.touched.description,
                          )}
                        >
                          <FormLabel
                            htmlFor="description"
                            fontSize="sm"
                            fontWeight="600"
                          >
                            Description
                          </FormLabel>
                          <Textarea
                            {...field}
                            id="description"
                            fontSize="sm"
                            shadow="sm"
                            size="sm"
                            rounded="md"
                          />
                          <FormErrorMessage>
                            {form.errors.description?.toString()}
                          </FormErrorMessage>
                        </FormControl>
                      )}
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
    </Stack>
  )
}
