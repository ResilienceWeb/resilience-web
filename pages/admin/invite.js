import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import { useEffect, useCallback } from 'react';
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
} from '@chakra-ui/react';
import { signIn, useSession } from 'next-auth/client';
import LayoutContainer from '@components/admin/layout-container';
import LoadingSpinner from '@components/loading-spinner';
import { useListings } from '@hooks/listings';
import { emailRequiredValidator } from '../../helpers/emails';

export default function Invite() {
	const [session, loadingSession] = useSession();
	const { listings, isLoading: isLoadingListings } = useListings();

	// useEffect(() => {
	// 	async function fetchData() {
	// 		const response = await fetch('/api/permissions/all');
	// 		const data = await response.json();
	// 		console.log('resp', data);
	// 	}
	// 	fetchData();
	// }, []);

	useEffect(() => {
		if (!session && !loadingSession) {
			signIn();
		}
	}, [session, loadingSession]);

	const inviteUser = useCallback(async (data) => {
		const response = await axios.post(
			`http://localhost:3000/api/inviteUser`,
			{
				email: data.email,
				listingId: data.listing,
			},
		);
		// console.log({ response });
	}, []);

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
			<Heading>Invite user</Heading>

			<Box mt={8} maxW="400px">
				<Formik
					initialValues={{
						email: 'ismail.diner+test7@gmail.com',
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
											isInvalid={form.errors.email}
										>
											<FormLabel htmlFor="email">
												Email
											</FormLabel>
											<Input {...field} id="email" />
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
											<Select {...field}>
												{listings.map((l) => (
													<option
														key={l.id}
														value={l.id}
													>
														{l.title}
													</option>
												))}
											</Select>
											<FormErrorMessage>
												{form.errors.listing}
											</FormErrorMessage>
											<FormHelperText>
												The listing the user will be
												able to edit
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
		</LayoutContainer>
	);
}
