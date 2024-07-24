'use client'
import { Formik, Form, Field, FormikHelpers } from 'formik'
import { useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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

export default function TeamPage() {
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
        // @ts-ignore
        filteredPermissions.push(permission)
      }
    })

    return filteredPermissions
  }, [ownerships, permissionsForCurrentWeb])

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
      <Center height="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (!hasPermissionForCurrentWeb && !isOwnerOfCurrentWeb) {
    router.push('/admin')
  }

  return (
    <Stack spacing="2rem" divider={<StackDivider />}>
      {isOwnerOfCurrentWeb && (
        <Box>
          <Heading mb="1.5rem">Invite team member</Heading>
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
                            <FormHelperText>
                              The invited user will have the permission to
                              add/edit listings, categories and tags.
                            </FormHelperText>
                          </FormControl>
                        )}
                      </Field>
                    </chakra.div>

                    <Button
                      mt={4}
                      variant="rw"
                      isDisabled={!props.isValid}
                      isLoading={props.isSubmitting}
                      type="submit"
                    >
                      Send invite
                    </Button>
                  </Form>
                )}
              </Formik>
            </Box>
          </Box>
        </Box>
      )}
      {(permissionsForCurrentWeb?.length > 0 ||
        decoratedOwnerships?.length > 0) && (
        <Box>
          <Heading>Team</Heading>
          <Text mb="1rem">
            List of people who have permissions to add and edit listings on the{' '}
            <b>{selectedWebName}</b> web.
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
  )
}
