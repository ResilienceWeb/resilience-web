import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { Formik, Form, Field } from 'formik';
import {
	chakra,
	Flex,
	Box,
	Stack,
	Button,
	Checkbox,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	InputGroup,
	InputLeftAddon,
	Textarea,
	Select,
	HStack,
	Text,
} from '@chakra-ui/react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import {
	useListing,
	useCreateListing,
	useUpdateListing,
} from '@hooks/listings';
import { useCategories } from '@hooks/categories';
import { emailValidator } from '@helpers/emails';
import ImageUpload from '@components/admin/listing-creation-dialog/ImageUpload';
import LayoutContainer from '@components/admin/layout-container';
import LoadingSpinner from '@components/loading-spinner';

function validateTextField(value) {
	let error;
	if (!value) {
		error = 'This field is required';
	}
	return error;
}

export default function Listing() {
	const router = useRouter();
	const { slug } = router.query;
	const { categories } = useCategories();
	const { mutate: updateListing } = useUpdateListing();
	const { mutate: createListing } = useCreateListing();

	const goBack = useCallback(() => {
		router.back();
	}, [router]);

	const handleSubmit = useCallback(
		(data) => {
			if (data.id) {
				updateListing(data);
			} else {
				createListing(data);
			}
			goBack();
		},
		[createListing, updateListing, goBack],
	);

	const { listing, isLoading, isError } = useListing(slug);

	if (!categories || !listing || isLoading) {
		return (
			<Flex height="100vh" justifyContent="center" alignItems="center">
				<LoadingSpinner />
			</Flex>
		);
	}

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
				<Button
					leftIcon={<IoMdArrowRoundBack />}
					colorScheme="teal"
					variant="outline"
					onClick={goBack}
				>
					Back
				</Button>

				<Box mt={4}>
					<Box
						shadow="base"
						rounded={[null, 'md']}
						overflow={{ sm: 'hidden' }}
					>
						<Stack bg="white" spacing={6}>
							<Formik
								initialValues={{
									id: listing?.id || null,
									title: listing?.title || '',
									description: listing?.description || '',
									category:
										listing?.category?.id ||
										categories[0].id,
									email: listing?.email || '',
									website: listing?.website || '',
									facebook: listing?.facebook || '',
									twitter: listing?.twitter || '',
									instagram: listing?.instagram || '',
									seekingVolunteers:
										listing?.seekingVolunteers || false,
									inactive: listing?.inactive || false,
									image: listing?.image,
									slug: listing?.slug || '',
								}}
								enableReinitialize
								onSubmit={handleSubmit}
							>
								{(props) => {
									return (
										<Form encType="multipart/form-data">
											<chakra.div
												p={{ sm: 6 }}
												px={4}
												py={5}
											>
												<chakra.div mb={3}>
													<Field
														name="title"
														validate={
															validateTextField
														}
													>
														{({ field, form }) => (
															<FormControl
																isInvalid={
																	form.errors
																		.title &&
																	form.touched
																		.title
																}
															>
																<FormLabel
																	htmlFor="title"
																	fontSize="sm"
																>
																	Title
																</FormLabel>
																<Input
																	{...field}
																	id="title"
																	fontSize="sm"
																	shadow="sm"
																	size="sm"
																	rounded="md"
																/>
																<FormErrorMessage>
																	{
																		form
																			.errors
																			.title
																	}
																</FormErrorMessage>
															</FormControl>
														)}
													</Field>
												</chakra.div>

												<chakra.div mb={3}>
													<Field
														name="description"
														style={{
															maxHeight: '200px',
														}}
													>
														{({ field, form }) => (
															<FormControl
																isInvalid={
																	form.errors
																		.description &&
																	form.touched
																		.description
																}
															>
																<FormLabel
																	htmlFor="description"
																	fontSize="sm"
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
																	{
																		form
																			.errors
																			.description
																	}
																</FormErrorMessage>
															</FormControl>
														)}
													</Field>
												</chakra.div>

												<chakra.div mb={3}>
													<Field name="category">
														{({ field, form }) => (
															<FormControl
																isInvalid={
																	form.errors
																		.category &&
																	form.touched
																		.category
																}
															>
																<FormLabel
																	htmlFor="category"
																	fontSize="sm"
																>
																	Category
																</FormLabel>
																<Select
																	{...field}
																	fontSize="sm"
																	shadow="sm"
																	size="sm"
																	rounded="md"
																>
																	{categories.map(
																		(c) => (
																			<option
																				key={
																					c.id
																				}
																				value={
																					c.id
																				}
																			>
																				{
																					c.label
																				}
																			</option>
																		),
																	)}
																</Select>
																<FormErrorMessage>
																	{
																		form
																			.errors
																			.category
																	}
																</FormErrorMessage>
															</FormControl>
														)}
													</Field>
												</chakra.div>

												<chakra.div mb={3}>
													<Field
														name="email"
														type="email"
														validate={
															emailValidator
														}
													>
														{({ field, form }) => (
															<FormControl
																isInvalid={
																	form.errors
																		.email &&
																	form.touched
																		.email
																}
															>
																<FormLabel
																	htmlFor="email"
																	fontSize="sm"
																>
																	Email
																</FormLabel>
																<Input
																	{...field}
																	id="email"
																	fontSize="sm"
																	shadow="sm"
																	size="sm"
																	rounded="md"
																/>
																<FormErrorMessage>
																	{
																		form
																			.errors
																			.email
																	}
																</FormErrorMessage>
															</FormControl>
														)}
													</Field>
												</chakra.div>

												<Field name="image">
													{({ field, form }) => (
														<ImageUpload
															field={field}
															form={form}
															formProps={props}
														/>
													)}
												</Field>

												<HStack
													align="stretch"
													spacing={2}
													mt={4}
												>
													<chakra.div
														mb={3}
														flexGrow={1}
													>
														<Field name="website">
															{({
																field,
																form,
															}) => (
																<FormControl
																	isInvalid={
																		form
																			.errors
																			.website &&
																		form
																			.touched
																			.website
																	}
																>
																	<FormLabel
																		htmlFor="title"
																		fontSize="sm"
																	>
																		Website
																	</FormLabel>
																	<Input
																		{...field}
																		id="website"
																		fontSize="sm"
																		shadow="sm"
																		size="sm"
																		rounded="md"
																	/>
																	<FormErrorMessage>
																		{
																			form
																				.errors
																				.website
																		}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
													</chakra.div>

													<chakra.div
														mb={3}
														flexGrow={1}
													>
														<Field name="facebook">
															{({
																field,
																form,
															}) => (
																<FormControl
																	isInvalid={
																		form
																			.errors
																			.facebook &&
																		form
																			.touched
																			.facebook
																	}
																>
																	<FormLabel
																		htmlFor="facebook"
																		fontSize="sm"
																	>
																		Facebook
																	</FormLabel>
																	<Input
																		{...field}
																		id="facebook"
																		fontSize="sm"
																		shadow="sm"
																		size="sm"
																		rounded="md"
																	/>
																	<FormErrorMessage>
																		{
																			form
																				.errors
																				.facebook
																		}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
													</chakra.div>
												</HStack>

												<HStack
													align="stretch"
													spacing={2}
												>
													<chakra.div
														mb={3}
														flexGrow={1}
													>
														<Field name="twitter">
															{({
																field,
																form,
															}) => (
																<FormControl
																	isInvalid={
																		form
																			.errors
																			.twitter &&
																		form
																			.touched
																			.twitter
																	}
																>
																	<FormLabel
																		htmlFor="twitter"
																		fontSize="sm"
																	>
																		Twitter
																	</FormLabel>
																	<Input
																		{...field}
																		id="twitter"
																		fontSize="sm"
																		shadow="sm"
																		size="sm"
																		rounded="md"
																	/>
																	<FormErrorMessage>
																		{
																			form
																				.errors
																				.twitter
																		}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
													</chakra.div>

													<chakra.div
														mb={3}
														flexGrow={1}
													>
														<Field name="instagram">
															{({
																field,
																form,
															}) => (
																<FormControl
																	isInvalid={
																		form
																			.errors
																			.instagram &&
																		form
																			.touched
																			.instagram
																	}
																>
																	<FormLabel
																		htmlFor="instagram"
																		fontSize="sm"
																	>
																		Instagram
																	</FormLabel>
																	<Input
																		{...field}
																		id="instagram"
																		fontSize="sm"
																		shadow="sm"
																		size="sm"
																		rounded="md"
																	/>
																	<FormErrorMessage>
																		{
																			form
																				.errors
																				.instagram
																		}
																	</FormErrorMessage>
																</FormControl>
															)}
														</Field>
													</chakra.div>
												</HStack>

												<chakra.div mb={3}>
													<Field name="slug">
														{({ field, form }) => (
															<FormControl
																isInvalid={
																	form.errors
																		.slug &&
																	form.touched
																		.slug
																}
															>
																<FormLabel
																	htmlFor="slug"
																	fontSize="sm"
																>
																	Url
																</FormLabel>
																<InputGroup size="sm">
																	<InputLeftAddon
																		bg="gray.50"
																		color="gray.500"
																		rounded="md"
																		userSelect="none"
																	>
																		cambridgeresilienceweb.org.uk/city/
																	</InputLeftAddon>
																	<Input
																		{...field}
																		id="slug"
																		fontSize="sm"
																		shadow="sm"
																		size="sm"
																		rounded="md"
																	/>
																</InputGroup>
																<FormErrorMessage>
																	{
																		form
																			.errors
																			.slug
																	}
																</FormErrorMessage>
															</FormControl>
														)}
													</Field>
												</chakra.div>

												<chakra.div mb={3}>
													<Field name="seekingVolunteers">
														{({ field, form }) => (
															<FormControl
																isInvalid={
																	form.errors
																		.seekingVolunteers &&
																	form.touched
																		.seekingVolunteers
																}
															>
																<Checkbox
																	isChecked={
																		field.value
																	}
																	id="seekingVolunteers"
																	onChange={
																		field.onChange
																	}
																>
																	Seeking
																	volunteers
																</Checkbox>
																<Text
																	color="gray.500"
																	fontSize="sm"
																>
																	Would this
																	group
																	benefit from
																	having
																	additional
																	volunteers?
																</Text>
																<FormErrorMessage>
																	{
																		form
																			.errors
																			.seekingVolunteers
																	}
																</FormErrorMessage>
															</FormControl>
														)}
													</Field>
												</chakra.div>

												<chakra.div mb={3}>
													<Field name="inactive">
														{({ field, form }) => (
															<FormControl
																isInvalid={
																	form.errors
																		.inactive &&
																	form.touched
																		.inactive
																}
															>
																<Checkbox
																	isChecked={
																		field.value
																	}
																	id="inactive"
																	onChange={
																		field.onChange
																	}
																>
																	Inactive
																</Checkbox>
																<Text
																	color="gray.500"
																	fontSize="sm"
																>
																	Has the
																	group been
																	inactive for
																	longer than
																	a year?
																</Text>
																<FormErrorMessage>
																	{
																		form
																			.errors
																			.inactive
																	}
																</FormErrorMessage>
															</FormControl>
														)}
													</Field>
												</chakra.div>
											</chakra.div>

											<Box
												px={{ base: 4, sm: 6 }}
												py={3}
												bg="gray.50"
												textAlign="right"
											>
												<Button
													bg="#57b894"
													colorScheme="#57b894"
													disabled={!props.isValid}
													isLoading={
														props.isSubmitting
													}
													size="md"
													type="submit"
													_hover={{ bg: '#4a9e7f' }}
												>
													{listing
														? 'Update'
														: 'Create'}
												</Button>
											</Box>
										</Form>
									);
								}}
							</Formik>
						</Stack>
					</Box>
				</Box>
			</Box>
		</LayoutContainer>
	);
}
