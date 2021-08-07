import { memo } from 'react';
import { Formik, Form, Field } from 'formik';
import {
	chakra,
	Button,
	Checkbox,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	Textarea,
	Select,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	HStack,
} from '@chakra-ui/react';
import { emailValidator } from '@helpers/emails';
import { useCategories } from '@hooks/categories';

function validateTextField(value) {
	let error;
	if (!value) {
		error = 'This field is required';
	}
	return error;
}

const ListingCreationDialog = ({ itemInEdit, onClose, onSubmit }) => {
	const { categories } = useCategories();

	if (!categories) return null; // TODO: add loading spinner?

	return (
		<Modal onClose={onClose} isOpen size="2xl">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>
					{itemInEdit ? 'Edit listing' : 'Create new listing'}
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Formik
						initialValues={{
							id: itemInEdit?.id || null,
							title: itemInEdit?.title || '',
							description: itemInEdit?.description || '',
							category:
								itemInEdit?.category.id || categories[0].id,
							email: itemInEdit?.email || '',
							website: itemInEdit?.website || '',
							facebook: itemInEdit?.facebook || '',
							twitter: itemInEdit?.twitter || '',
							instagram: itemInEdit?.instagram || '',
							seekingVolunteers:
								itemInEdit?.seekingVolunteers || false,
							inactive: itemInEdit?.inactive || false,
						}}
						onSubmit={onSubmit}
					>
						{(props) => (
							<Form>
								<chakra.div mb={3}>
									<Field
										name="title"
										validate={validateTextField}
									>
										{({ field, form }) => (
											<FormControl
												isInvalid={
													form.errors.title &&
													form.touched.title
												}
											>
												<FormLabel htmlFor="title">
													Title
												</FormLabel>
												<Input {...field} id="title" />
												<FormErrorMessage>
													{form.errors.title}
												</FormErrorMessage>
											</FormControl>
										)}
									</Field>
								</chakra.div>

								<chakra.div mb={3}>
									<Field
										name="description"
										style={{ maxHeight: '200px' }}
									>
										{({ field, form }) => (
											<FormControl
												isInvalid={
													form.errors.description &&
													form.touched.description
												}
											>
												<FormLabel htmlFor="description">
													Description
												</FormLabel>
												<Textarea
													{...field}
													id="description"
												/>
												<FormErrorMessage>
													{form.errors.description}
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
													form.errors.category &&
													form.touched.category
												}
											>
												<FormLabel htmlFor="category">
													Category
												</FormLabel>
												<Select {...field}>
													{categories.map((c) => (
														<option
															key={c.id}
															value={c.id}
														>
															{c.label}
														</option>
													))}
												</Select>
												<FormErrorMessage>
													{form.errors.category}
												</FormErrorMessage>
											</FormControl>
										)}
									</Field>
								</chakra.div>

								<chakra.div mb={3}>
									<Field
										name="email"
										type="email"
										validate={emailValidator}
									>
										{({ field, form }) => (
											<FormControl
												isInvalid={
													form.errors.email &&
													form.touched.email
												}
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

								<HStack align="stretch" spacing={2}>
									<chakra.div mb={3} flexGrow={1}>
										<Field name="website">
											{({ field, form }) => (
												<FormControl
													isInvalid={
														form.errors.website &&
														form.touched.website
													}
												>
													<FormLabel htmlFor="title">
														Website
													</FormLabel>
													<Input
														{...field}
														id="website"
													/>
													<FormErrorMessage>
														{form.errors.website}
													</FormErrorMessage>
												</FormControl>
											)}
										</Field>
									</chakra.div>

									<chakra.div mb={3} flexGrow={1}>
										<Field name="facebook">
											{({ field, form }) => (
												<FormControl
													isInvalid={
														form.errors.facebook &&
														form.touched.facebook
													}
												>
													<FormLabel htmlFor="facebook">
														Facebook
													</FormLabel>
													<Input
														{...field}
														id="facebook"
													/>
													<FormErrorMessage>
														{form.errors.facebook}
													</FormErrorMessage>
												</FormControl>
											)}
										</Field>
									</chakra.div>
								</HStack>

								<HStack align="stretch" spacing={2}>
									<chakra.div mb={3} flexGrow={1}>
										<Field name="twitter">
											{({ field, form }) => (
												<FormControl
													isInvalid={
														form.errors.twitter &&
														form.touched.twitter
													}
												>
													<FormLabel htmlFor="twitter">
														Twitter
													</FormLabel>
													<Input
														{...field}
														id="twitter"
													/>
													<FormErrorMessage>
														{form.errors.twitter}
													</FormErrorMessage>
												</FormControl>
											)}
										</Field>
									</chakra.div>

									<chakra.div mb={3} flexGrow={1}>
										<Field name="instagram">
											{({ field, form }) => (
												<FormControl
													isInvalid={
														form.errors.instagram &&
														form.touched.instagram
													}
												>
													<FormLabel htmlFor="instagram">
														Instagram
													</FormLabel>
													<Input
														{...field}
														id="instagram"
													/>
													<FormErrorMessage>
														{form.errors.instagram}
													</FormErrorMessage>
												</FormControl>
											)}
										</Field>
									</chakra.div>
								</HStack>

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
													isChecked={field.value}
													id="seekingVolunteers"
													onChange={field.onChange}
												>
													Seeking volunteers
												</Checkbox>
												<FormErrorMessage>
													{
														form.errors
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
													form.errors.inactive &&
													form.touched.inactive
												}
											>
												<Checkbox
													isChecked={field.value}
													id="inactive"
													onChange={field.onChange}
												>
													Inactive
												</Checkbox>
												<FormErrorMessage>
													{form.errors.inactive}
												</FormErrorMessage>
											</FormControl>
										)}
									</Field>
								</chakra.div>

								<Button
									bg="#57b894"
									colorScheme="#57b894"
									disabled={!props.isValid}
									isLoading={props.isSubmitting}
									size="md"
									type="submit"
									_hover={{ bg: '#4a9e7f' }}
								>
									Submit
								</Button>
							</Form>
						)}
					</Formik>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default memo(ListingCreationDialog);
