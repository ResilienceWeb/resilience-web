import { Formik, Form, Field, FormikHelpers, FieldProps } from 'formik'
import { useEffect, useCallback, useMemo } from 'react'
import Select from 'react-select'
import type { Options } from 'react-select'
import {
  chakra,
  Box,
  Button,
  Heading,
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
  const toast = useToast()

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
      const listingIdsAdded = data.listings.map((l) => l.value)
      const listingsToAdd = listings?.filter((l) =>
        listingIdsAdded.includes(l.id),
      )
      const response = await fetch(`${REMOTE_URL}/api/auth/inviteUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          email: data.email,
          listings: listingsToAdd,
        }),
      })
      const result = await response.json()
      console.log(result, response)

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
    [listings, toast],
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

  if (!session || !session.user.admin) return null

  return (
    <LayoutContainer>
      <Box
        px={{
          base: '4',
          md: '10',
        }}
        py={4}
        maxWidth="3xl"
        mx="auto"
      >
        <Stack spacing="4" divider={<StackDivider />}>
          <Heading>Invite user</Heading>

          <Box mt={6} maxW="400px">
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
                            isInvalid={Boolean(
                              form.errors.listings && form.touched.listings,
                            )}
                          >
                            <FormLabel htmlFor="listings">Listings</FormLabel>
                            <InputGroup size="sm">
                              <Select
                                isMulti
                                isSearchable
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
        </Stack>
      </Box>
    </LayoutContainer>
  )
}
