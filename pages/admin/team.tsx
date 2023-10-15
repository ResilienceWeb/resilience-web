import { Formik, Form, Field, FormikHelpers, FieldProps } from 'formik'
import { useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import ReactSelect from 'react-select'
import type { Options } from 'react-select'
import { NextSeo } from 'next-seo'
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
  Text,
} from '@chakra-ui/react'
import { signIn, useSession } from 'next-auth/react'
import LayoutContainer from '@components/admin/layout-container'
// import PermissionsList from '@components/admin/permissions-list'
import PermissionsTable from '@components/admin/permissions-table'
import { useListings } from '@hooks/listings'
import { emailRequiredValidator } from '@helpers/formValidation'
import { REMOTE_URL } from '@helpers/config'
import {
  useHasPermissionForCurrentWeb,
  usePermissions,
  usePermissionsForCurrentWeb,
} from '@hooks/permissions'
import { useIsOwnerOfCurrentWeb, useOwnerships } from '@hooks/ownership'
import { useSelectedWebName } from '@hooks/webs'
import { useAppContext } from '@store/hooks'

const customMultiSelectStyles = {
  container: () => ({
    width: '100%',
  }),
  menuPortal: (baseStyles) => ({
    ...baseStyles,
    zIndex: 10,
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
  const toast = useToast()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const { listings, isLoading: isLoadingListings } = useListings()
  const hasPermissionForCurrentWeb = useHasPermissionForCurrentWeb()
  const isOwnerOfCurrentWeb = useIsOwnerOfCurrentWeb()
  const { isLoading: isLoadingPermissions } = usePermissions()
  const { data: permissionsForCurrentWeb } = usePermissionsForCurrentWeb()
  const { ownerships } = useOwnerships()
  const selectedWebName = useSelectedWebName()
  const { selectedWebId } = useAppContext()

  const decoratedOwnerships = useMemo(() => {
    if (!ownerships) {
      return []
    }

    return ownerships
      .filter((ownership) => !ownership.user.admin)
      .map((ownership) => ({ ...ownership, owner: true }))
  }, [ownerships])

  const permissionsForCurrentWebWithoutOwners = useMemo(() => {
    const filteredPermissions = []
    const ownershipsEmails = ownerships?.map((o) => o.user.email)
    permissionsForCurrentWeb?.map((permission) => {
      if (!ownershipsEmails?.includes(permission.user.email)) {
        filteredPermissions.push(permission)
      }
    })

    return filteredPermissions
  }, [ownerships, permissionsForCurrentWeb])

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

  const sendInvite = useCallback(
    async (data, actions: FormikHelpers<FormValues>) => {
      const body: {
        email: string
        web?: string
        listings?: any
        inviteToWeb: boolean
      } = {
        email: data.email,
        inviteToWeb: false,
      }
      body.web = selectedWebId
      if (data.web === true) {
        body.inviteToWeb = true
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
      } else {
        toast({
          title: 'Error',
          description: `There was an error. Please try again or contact the developers.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }

      actions.resetForm()
      actions.setFieldValue('web', false)
    },
    [listings, selectedWebId, toast],
  )

  if (
    sessionStatus === 'loading' ||
    isLoadingListings ||
    isLoadingPermissions
  ) {
    return (
      <LayoutContainer>
        <Center height="100%">
          <Spinner size="xl" />
        </Center>
      </LayoutContainer>
    )
  }

  if (!session) return null

  if (!hasPermissionForCurrentWeb && !isOwnerOfCurrentWeb) {
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
        <Box px={{ base: '4', md: '10' }} py={4} maxWidth="3xl" mx="auto">
          <Stack spacing="4" divider={<StackDivider />}>
            <Heading>Invite new member</Heading>
            <Box
              shadow="base"
              rounded={[null, 'md']}
              overflow={{ sm: 'hidden' }}
              bg="white"
              padding="1rem"
            >
              <Box maxW="450px">
                <Formik
                  initialValues={{
                    email: '',
                    listings: [],
                  }}
                  onSubmit={sendInvite}
                  enableReinitialize
                >
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
                                <FormLabel htmlFor="listings">
                                  Listings
                                </FormLabel>
                                <InputGroup size="sm">
                                  <ReactSelect
                                    isMulti
                                    isSearchable
                                    isDisabled={props.values.web === true}
                                    menuPortalTarget={document.body}
                                    onChange={(_option, changeData) => {
                                      let newValue
                                      if (
                                        changeData.action === 'select-option'
                                      ) {
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
                                    value={field.value}
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

                      {isOwnerOfCurrentWeb && (
                        <chakra.div my="2rem">
                          <Field name="web">
                            {({ field, form }: FieldProps) => {
                              return (
                                <FormControl
                                  isInvalid={Boolean(
                                    form.errors.web && form.touched.web,
                                  )}
                                >
                                  <Checkbox
                                    isChecked={field.value}
                                    id="web"
                                    onChange={field.onChange}
                                  >
                                    Give Editor access to the{' '}
                                    <strong>{selectedWebName}</strong> web
                                  </Checkbox>
                                  <FormErrorMessage>
                                    {form.errors.web?.toString()}
                                  </FormErrorMessage>
                                  <FormHelperText>
                                    Checking this box gives the invited user
                                    full access to add/edit listings, categories
                                    and tags as well as invite others. Use this
                                    carefully.
                                  </FormHelperText>
                                </FormControl>
                              )
                            }}
                          </Field>
                        </chakra.div>
                      )}

                      <Button
                        bg="rw.700"
                        colorScheme="rw.700"
                        mt={4}
                        variant="solid"
                        isDisabled={!props.isValid}
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
            {permissionsForCurrentWeb?.length > 0 && (
              <Box>
                <Heading>Team</Heading>
                <Text mb="1rem">
                  List of people who have permissions to edit some or all the
                  listings on the <b>{selectedWebName}</b> web.
                </Text>
                {/* {isOwnerOfCurrentWeb ? (
                  <PermissionsList permissions={permissionsForCurrentWeb} />
                ) : ( */}
                <PermissionsTable
                  permissions={[
                    ...decoratedOwnerships,
                    ...permissionsForCurrentWebWithoutOwners,
                  ]}
                />
                {/* )} */}
              </Box>
            )}
          </Stack>
        </Box>
      </LayoutContainer>
    </>
  )
}
