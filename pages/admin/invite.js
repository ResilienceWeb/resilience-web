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
	useToast,
} from '@chakra-ui/react';
import { signIn, useSession } from 'next-auth/client';
import LayoutContainer from '@components/admin/layout-container';
import LoadingSpinner from '@components/loading-spinner';
import { useListings } from '@hooks/listings';
import { emailRequiredValidator } from '../../helpers/emails';
import { REMOTE_URL } from '../../helpers/config';

export default function Invite() {
	const [session, loadingSession] = useSession();
	const { listings, isLoading: isLoadingListings } = useListings();
	const toast = useToast();

	useEffect(() => {
		if (!session && !loadingSession) {
			signIn();
		}
	}, [session, loadingSession]);

	const inviteUser = useCallback(
		async (data) => {
			const response = await axios.post(
				`${REMOTE_URL}/api/auth/inviteUser`,
				{
					email: data.email,
					listingId: data.listing,
				},
			);

			if (response.status === 200) {
				toast({
					title: 'Success',
					description: `Invite sent to ${data.email}`,
					status: 'success',
					duration: 5000,
					isClosable: true,
				});
			}
		},
		[toast],
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
			<Heading>Invite user</Heading>

			<Box mt={8} maxW="400px">
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
