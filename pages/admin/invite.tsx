import { Formik, Form, Field, FormikHelpers, FieldProps } from 'formik'
import { useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import Select from 'react-select'
import type { Options } from 'react-select'
import {
  chakra,
  Box,
  Button,
  Heading,
  Checkbox,
  Input,
  InputGroup,
  FormControl,
  FormErrorMessage,
  FormLabel,
  FormHelperText,
  useToast,
  Stack,
  StackDivider,
  Center,
  Spinner,
} from '@chakra-ui/react'
import { signIn, useSession } from 'next-auth/react'
import LayoutContainer from '@components/admin/layout-container'
import { useListings } from '@hooks/listings'
import { emailRequiredValidator } from '@helpers/formValidation'
import { REMOTE_URL } from '@helpers/config'
import { useHasPermissionForCurrentWeb } from '@hooks/permissions'
import { useSelectedWebName } from '@hooks/webs'
import { useAppContext } from '@store/hooks'

const customMultiSelectStyles = {
  container: () => ({
    width: '100%',
  }),
}

interface FormValues {
  email: string
  listings: string[]
}

type ListingOption = {
  value: number
  label: string
}

export default function Invite() {
  const { data: session, status: sessionStatus } = useSession()
  const { listings, isLoading: isLoadingListings } = useListings()
  const hasPermissionForCurrentWeb = useHasPermissionForCurrentWeb()
  const selectedWebName = useSelectedWebName()
  const { selectedWebId } = useAppContext()
  const toast = useToast()
  const router = useRouter()

  useEffect(() => {
    async function signInIfNeeded() {
      if (!session && !(sessionStatus === 'loading')) {
        await signIn()
      }
    }
    void signInIfNeeded()
  }, [session, sessionStatus])

  const listingOptions: Options<ListingOption> = useMemo(() => {
    if (!listings) return []

    return listings.map((l) => ({
      value: l.id,
      label: l.title,
    }))
  }, [listings])

  const inviteUser = useCallback(
    async (data, actions: FormikHelpers<FormValues>) => {
      const body: { email: string; web?: string; listings?: any } = {
        email: data.email,
      }
      if (data.web === true) {
        body.web = selectedWebId
      } else {
        const listingIdsAdded = data.listings.map((l) => l.value)
        const listingsToAdd = listings?.filter((l) =>
          listingIdsAdded.includes(l.id),
        )
        body.listings = listingsToAdd
      }

      const response = await fetch(`${REMOTE_URL}/api/auth/inviteUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(body),
      })

      if (response.status === 200) {
        toast({
          title: 'Success',
          description: `Invite sent to ${data.email}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        actions.setFieldValue('email', '', false)
        actions.setFieldValue('listings', [])
      } else if (response.status === 409) {
        toast({
          title: 'User already invited',
          description: `This user already received an invite. Please use Permissions page to edit their permissions.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Error',
          description: `There was an error. Please try again or contact the developers.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    },
    [listings, selectedWebId, toast],
  )

  const initialValues = useMemo<FormValues>(
    () => ({
      email: '',
      listings: [],
    }),
    [],
  )

  if (sessionStatus === 'loading' || isLoadingListings) {
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
          <Heading>Invite user</Heading>

          <Box
            shadow="base"
            rounded={[null, 'md']}
            overflow={{ sm: 'hidden' }}
            bg="white"
            padding="1rem"
          >
            <Box maxW="450px">
              <Formik initialValues={initialValues} onSubmit={inviteUser}>
                {(props) => (
                  <Form>
                    <chakra.div mb={3}>
                      <Field
                        name="email"
                        type="email"
                        validate={emailRequiredValidator}
                      >
                        {({ field, form }) => (
                          <FormControl isInvalid={form.errors.email}>
                            <FormLabel htmlFor="email">Email</FormLabel>
                            <Input {...field} id="email" background="white" />
                            <FormErrorMessage>
                              {form.errors.email}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </chakra.div>
                    <chakra.div mb={3}>
                      <Field name="listings">
                        {({ field, form }: FieldProps) => {
                          return (
                            <FormControl
                              isDisabled={props.values.web === true}
                              isInvalid={Boolean(
                                form.errors.listings && form.touched.listings,
                              )}
                            >
                              <FormLabel htmlFor="listings">Listings</FormLabel>
                              <InputGroup size="sm">
                                <Select
                                  isMulti
                                  isSearchable
                                  isDisabled={props.values.web === true}
                                  onChange={(_option, changeData) => {
                                    let newValue
                                    if (changeData.action === 'select-option') {
                                      newValue = [
                                        ...field.value,
                                        changeData.option,
                                      ]
                                    } else if (
                                      changeData.action === 'remove-value' ||
                                      changeData.action === 'pop-value'
                                    ) {
                                      newValue = field.value.filter(
                                        (v) =>
                                          v.value !==
                                          changeData.removedValue.value,
                                      )
                                    }
                                    form.setFieldValue(field.name, newValue)
                                  }}
                                  options={listingOptions}
                                  placeholder=""
                                  isClearable={false}
                                  styles={customMultiSelectStyles}
                                />
                              </InputGroup>
                              <FormErrorMessage>
                                {form.errors.listings?.toString()}
                              </FormErrorMessage>
                              <FormHelperText>
                                The listings the user will be able to edit
                              </FormHelperText>
                            </FormControl>
                          )
                        }}
                      </Field>
                    </chakra.div>

                    <chakra.div my="2rem">
                      <Field name="web">
                        {({ field, form }: FieldProps) => {
                          return (
                            <FormControl
                              isInvalid={Boolean(
                                form.errors.listings && form.touched.listings,
                              )}
                            >
                              <Checkbox
                                isChecked={field.value}
                                id="web"
                                onChange={field.onChange}
                              >
                                Give full access to{' '}
                                <strong>{selectedWebName}</strong>
                              </Checkbox>
                              <FormErrorMessage>
                                {form.errors.web?.toString()}
                              </FormErrorMessage>
                              <FormHelperText>
                                Checking this box gives the invited user full
                                access to add/edit listings, categories and tags
                                as well as invite others. Use this carefully.
                              </FormHelperText>
                            </FormControl>
                          )
                        }}
                      </Field>
                    </chakra.div>

                    <Button
                      bg="rw.700"
                      colorScheme="rw.700"
                      mt={4}
                      variant="solid"
                      disabled={!props.isValid}
                      isLoading={props.isSubmitting}
                      type="submit"
                      _hover={{ bg: 'rw.900' }}
                    >
                      Send invite
                    </Button>
                  </Form>
                )}
              </Formik>
            </Box>
          </Box>
        </Stack>
      </Box>
    </LayoutContainer>
  )
}
