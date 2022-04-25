import { Formik, Form, Field, FormikHelpers } from 'formik'
import { useEffect, useCallback, useMemo } from 'react'
import {
    chakra,
    Box,
    Button,
    Heading,
    Input,
    Select,
    FormControl,
    FormErrorMessage,
    FormLabel,
    FormHelperText,
    useToast,
    Stack,
    StackDivider,
} from '@chakra-ui/react'
import { signIn, useSession } from 'next-auth/react'
import LayoutContainer from '@components/admin/layout-container'
import LoadingSpinner from '@components/loading-spinner'
import { useListings } from '@hooks/listings'
import { sortStringsFunc } from '@helpers/utils'
import { emailRequiredValidator } from '@helpers/formValidation'
import { REMOTE_URL } from '@helpers/config'

interface FormValues {
    email: string
    listing: string
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

    const orderedListings = useMemo(() => {
        return listings?.sort(sortStringsFunc)
    }, [listings])

    const inviteUser = useCallback(
        async (data, actions: FormikHelpers<FormValues>) => {
            const response = await fetch(`${REMOTE_URL}/api/auth/inviteUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
                body: JSON.stringify({
                    email: data.email,
                    listing: listings?.find((l) => l.id == data.listing),
                }),
            })
            const result = await response.json()

            if (!result.error) {
                toast({
                    title: 'Success',
                    description: `Invite sent to ${data.email}`,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                })
                actions.setFieldValue('email', '', false)
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
            listing: listings ? listings[0].id : '',
        }),
        [listings],
    )

    if (sessionStatus === 'loading' || isLoadingListings) {
        return (
            <LayoutContainer>
                <LoadingSpinner />
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
                        <Formik
                            initialValues={initialValues}
                            onSubmit={inviteUser}
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
                                                <FormControl
                                                    isInvalid={
                                                        form.errors.email
                                                    }
                                                >
                                                    <FormLabel htmlFor="email">
                                                        Email
                                                    </FormLabel>
                                                    <Input
                                                        {...field}
                                                        id="email"
                                                        background="white"
                                                    />
                                                    <FormErrorMessage>
                                                        {form.errors.email}
                                                    </FormErrorMessage>
                                                </FormControl>
                                            )}
                                        </Field>
                                    </chakra.div>
                                    <chakra.div mb={3}>
                                        <Field name="listing">
                                            {({ field, form }) => (
                                                <FormControl
                                                    isInvalid={
                                                        form.errors.listing &&
                                                        form.touched.listing
                                                    }
                                                >
                                                    <FormLabel htmlFor="listing">
                                                        Listing
                                                    </FormLabel>
                                                    <Select
                                                        {...field}
                                                        background="white"
                                                    >
                                                        {orderedListings.map(
                                                            (l) => (
                                                                <option
                                                                    key={l.id}
                                                                    value={l.id}
                                                                >
                                                                    {l.title}
                                                                </option>
                                                            ),
                                                        )}
                                                    </Select>
                                                    <FormErrorMessage>
                                                        {form.errors.listing}
                                                    </FormErrorMessage>
                                                    <FormHelperText>
                                                        The listing the user
                                                        will be able to edit
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
