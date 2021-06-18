import { Formik, Form, Field } from 'formik';
import {
	chakra,
	Button,
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
	ModalFooter,
	ModalBody,
	ModalCloseButton,
} from '@chakra-ui/react';
import CATEGORY_MAPPING from '../../../data/enums.js';

const emailRegex = new RegExp(/\S+@\S+\.\S+/);
const emailValidator = (value) => {
	if (value === '') return false;
	return emailRegex.test(value) ? '' : 'Please enter a valid email.';
};

function validateTextField(value) {
	let error;
	if (!value) {
		error = 'This field is required';
	}
	return error;
}

const ListingCreationDialog = ({ itemInEdit, onClose, onSubmit }) => {
	return (
		<Modal isCentered onClose={onClose} isOpen size="xl">
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
							category: itemInEdit?.category || '',
							email: itemInEdit?.email || '',
							website: itemInEdit?.website || '',
							facebook: itemInEdit?.facebook || '',
							twitter: itemInEdit?.twitter || '',
							instagram: itemInEdit?.instagram || '',
						}}
						onSubmit={onSubmit}
					>
						{(props) => (
							<Form
							// style={{
							// 	maxWidth: 650,
							// 	height: '100%',
							// 	display: 'flex',
							// 	flexDirection: 'column',
							// 	justifyContent: 'space-between',
							// }}
							>
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
													{Object.keys(
														CATEGORY_MAPPING,
													).map((c) => (
														<option
															key={c}
															value={c}
														>
															{c}
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

								<chakra.div mb={3}>
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

								<chakra.div mb={3}>
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

								<chakra.div mb={3}>
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

								<chakra.div mb={3}>
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

export default ListingCreationDialog;
