import { Formik, Form, Field, FormikHelpers } from 'formik'
import { useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import {
  chakra,
  Box,
  Button,
  Heading,
  Input,
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
import PermissionsTable from '@components/admin/permissions-table'
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

interface FormValues {
  email: string
  listings: string[]
}

export default function Team() {
  const toast = useToast()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const hasPermissionForCurrentWeb = useHasPermissionForCurrentWeb()
  const isOwnerOfCurrentWeb = useIsOwnerOfCurrentWeb()
  const { isPending: isPermissionsPending } = usePermissions()
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

  const sendInvite = useCallback(
    async (data, actions: FormikHelpers<FormValues>) => {
      const body: {
        email: string
        web?: string
      } = {
        email: data.email,
        web: selectedWebId,
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
    [selectedWebId, toast],
  )

  if (sessionStatus === 'loading' || isPermissionsPending) {
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
            {isOwnerOfCurrentWeb && (
              <>
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
                                  <Input
                                    {...field}
                                    id="email"
                                    background="white"
                                  />
                                  <FormErrorMessage>
                                    {form.errors.email}
                                  </FormErrorMessage>
                                  <FormHelperText>
                                    The invited user will have the permission to
                                    add/edit listings, categories and tags.
                                  </FormHelperText>
                                </FormControl>
                              )}
                            </Field>
                          </chakra.div>

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
              </>
            )}
            {permissionsForCurrentWeb?.length > 0 && (
              <Box>
                <Heading>Team</Heading>
                <Text mb="1rem">
                  List of people who have permissions to edit some or all the
                  listings on the <b>{selectedWebName}</b> web.
                </Text>
                <PermissionsTable
                  permissions={[
                    ...decoratedOwnerships,
                    ...permissionsForCurrentWebWithoutOwners,
                  ]}
                />
              </Box>
            )}
          </Stack>
        </Box>
      </LayoutContainer>
    </>
  )
}
