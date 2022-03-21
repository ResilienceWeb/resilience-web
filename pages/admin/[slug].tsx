import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { Formik, Form, Field, useField, FieldProps } from 'formik';
import { Editor } from '@tinymce/tinymce-react';
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
	Select,
	HStack,
	Text,
} from '@chakra-ui/react';
import { HiArrowLeft } from 'react-icons/hi';
import {
	useListing,
	useCreateListing,
	useUpdateListing,
} from '@hooks/listings';
import { useCategories } from '@hooks/categories';
import {
	emailValidator,
	fieldRequiredValidator,
} from '@helpers/formValidation';
import ImageUpload from '@components/admin/listing-creation-dialog/ImageUpload';
import LayoutContainer from '@components/admin/layout-container';
import LoadingSpinner from '@components/loading-spinner';

const EditorField = (props) => {
	const { label, name, ...otherProps } = props;
	const [field, meta] = useField(name);
	const type = 'text';
	const handleEditorChange = (value) => {
		field.onChange({ target: { type, name, value } });
	};

	const handleBlur = () => {
		field.onBlur({ target: { name } });
	};

	return (
		<>
			{label && <label>{label}</label>}
			<Editor
				{...otherProps}
				apiKey={process.env.TINY_APIKEY}
				value={field.value}
				onEditorChange={handleEditorChange}
				onBlur={handleBlur}
				init={{
					height: 500,
					menubar: false,
					plugins: [
						'advlist autolink lists link anchor',
						'visualblocks code fullscreen',
						'table paste code help wordcount',
					],
					toolbar:
						'undo redo | formatselect | ' +
						'bold italic backcolor | bullist numlist |' +
						'help',
				}}
			></Editor>
			{meta.touched && meta.error ? (
				<div className="error">{meta.error}</div>
			) : null}
		</>
	);
};

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
					leftIcon={<HiArrowLeft />}
					name="Back"
					mb={2}
					ml={2}
					onClick={goBack}
					variant="link"
					color="gray.700"
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
															fieldRequiredValidator
														}
													>
														{({
															field,
															form,
														}: FieldProps) => (
															<FormControl
																isInvalid={Boolean(
																	form.errors
																		.title &&
																		form
																			.touched
																			.title,
																)}
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
														{({
															form,
														}: FieldProps) => (
															<FormControl
																isInvalid={Boolean(
																	form.errors
																		.description &&
																		form
																			.touched
																			.description,
																)}
															>
																<FormLabel
																	htmlFor="description"
																	fontSize="sm"
																>
																	Description
																</FormLabel>
																<EditorField name="description" />
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
														{({
															field,
															form,
														}: FieldProps) => (
															<FormControl
																isInvalid={Boolean(
																	form.errors
																		.category &&
																		form
																			.touched
																			.category,
																)}
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
														{({
															field,
															form,
														}: FieldProps) => (
															<FormControl
																isInvalid={Boolean(
																	form.errors
																		.email &&
																		form
																			.touched
																			.email,
																)}
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
													{({
														field,
														form,
													}: FieldProps) => (
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
															}: FieldProps) => (
																<FormControl
																	isInvalid={Boolean(
																		form
																			.errors
																			.website &&
																			form
																				.touched
																				.website,
																	)}
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
															}: FieldProps) => (
																<FormControl
																	isInvalid={Boolean(
																		form
																			.errors
																			.facebook &&
																			form
																				.touched
																				.facebook,
																	)}
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
															}: FieldProps) => (
																<FormControl
																	isInvalid={Boolean(
																		form
																			.errors
																			.twitter &&
																			form
																				.touched
																				.twitter,
																	)}
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
															}: FieldProps) => (
																<FormControl
																	isInvalid={Boolean(
																		form
																			.errors
																			.instagram &&
																			form
																				.touched
																				.instagram,
																	)}
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
														{({
															field,
															form,
														}: FieldProps) => (
															<FormControl
																isInvalid={Boolean(
																	form.errors
																		.slug &&
																		form
																			.touched
																			.slug,
																)}
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
														{({
															field,
															form,
														}: FieldProps) => (
															<FormControl
																isInvalid={Boolean(
																	form.errors
																		.seekingVolunteers &&
																		form
																			.touched
																			.seekingVolunteers,
																)}
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
														{({
															field,
															form,
														}: FieldProps) => (
															<FormControl
																isInvalid={Boolean(
																	form.errors
																		.inactive &&
																		form
																			.touched
																			.inactive,
																)}
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
													bg="rw.700"
													colorScheme="rw.700"
													disabled={!props.isValid}
													isLoading={
														props.isSubmitting
													}
													size="md"
													type="submit"
													_hover={{ bg: 'rw.900' }}
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
