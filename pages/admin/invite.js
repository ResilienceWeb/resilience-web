import { Formik, Form, Field } from 'formik';
import { useEffect, useCallback, useMemo } from 'react';
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
} from '@chakra-ui/react';
import { signIn, useSession } from 'next-auth/client';
import LayoutContainer from '@components/admin/layout-container';
import LoadingSpinner from '@components/loading-spinner';
import { useListings } from '@hooks/listings';
import { sortStringsFunc } from '@helpers/utils';
import { emailRequiredValidator } from '@helpers/emails';
import { REMOTE_URL } from '@helpers/config';

export default function Invite() {
	const [session, loadingSession] = useSession();
	const { listings, isLoading: isLoadingListings } = useListings();
	const toast = useToast();

	useEffect(() => {
		if (!session && !loadingSession) {
			signIn();
		}
	}, [session, loadingSession]);

	const orderedListings = useMemo(() => {
		return listings?.sort(sortStringsFunc);
	}, [listings]);

	const inviteUser = useCallback(
		async (data) => {
			const response = await fetch(`${REMOTE_URL}/api/auth/inviteUser`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json;charset=utf-8',
				},
				body: JSON.stringify({
					email: data.email,
					listing: listings?.find((l) => l.id == data.listing),
				}),
			});
			const result = await response.json();

			if (!result.error) {
				toast({
					title: 'Success',
					description: `Invite sent to ${data.email}`,
					status: 'success',
					duration: 5000,
					isClosable: true,
				});
			} else {
				toast({
					title: 'Error',
					description: `There was an error. Please try again or contact the developers.`,
					status: 'error',
					duration: 5000,
					isClosable: true,
				});
			}
		},
		[listings, toast],
	);

	if (loadingSession || isLoadingListings) {
		return (
			<LayoutContainer>
				<LoadingSpinner />
			</LayoutContainer>
		);
	}

	if (!session || !session.user.admin) return null;

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
							initialValues={{
								email: '',
								listing: listings[0].id,
							}}
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
										bg="#57b894"
										colorScheme="#57b894"
										mt={4}
										variant="solid"
										disabled={!props.isValid}
										isLoading={props.isSubmitting}
										type="submit"
										_hover={{ bg: '#4a9e7f' }}
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
	);
}
