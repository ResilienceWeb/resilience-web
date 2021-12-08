import { memo, useContext, useCallback } from 'react';
import { Formik, Form, Field } from 'formik';
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	FormControl,
	FormLabel,
	FormErrorMessage,
	FormHelperText,
	Input,
	Button,
	Textarea,
	chakra,
	useToast,
} from '@chakra-ui/react';
import { AppContext } from '@store/AppContext';
import {
	emailRequiredValidator,
	fieldRequiredValidator,
} from '@helpers/formValidation';
import { REMOTE_URL } from '@helpers/config';

const FeedbackDialog = ({ isOpen, onClose }) => {
	const { isMobile } = useContext(AppContext);
	const toast = useToast();

	const onFormSubmit = useCallback(async (data) => {
		const response = await fetch(`${REMOTE_URL}/api/feedback`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
			},
			body: JSON.stringify({
				email: data.email,
				feedback: data.feedback,
			}),
		});
		const result = await response.json();

		if (!result.error) {
			toast({
				title: 'Success',
				description: `Feedback sent! Thank you.`,
				status: 'success',
				duration: 5000,
				isClosable: true,
			});

			onClose();
		} else {
			toast({
				title: 'Error',
				description: `There was an error. Please try again or email directly at cambridgeresilienceweb@gmail.com`,
				status: 'error',
				duration: 5000,
				isClosable: true,
			});
		}
	}, []);

	return (
		<Modal
			isCentered={!isMobile}
			isOpen={isOpen}
			onClose={onClose}
			size={isMobile ? 'full' : 'xl'}
		>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Feedback</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Formik
						initialValues={{
							email: '',
							feedback: '',
						}}
						onSubmit={onFormSubmit}
					>
						{(props) => {
							return (
								<Form>
									<chakra.div mb={5}>
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
													<FormHelperText>
														So we know how to reply
														to you
													</FormHelperText>
												</FormControl>
											)}
										</Field>
									</chakra.div>
									<chakra.div mb={3}>
										<Field
											name="feedback"
											validate={fieldRequiredValidator}
											style={{
												maxHeight: '200px',
											}}
										>
											{({ field, form }) => (
												<FormControl
													isInvalid={
														form.errors.feedback &&
														form.touched.feedback
													}
												>
													<FormLabel htmlFor="feedback">
														Feedback
													</FormLabel>
													<Textarea
														{...field}
														id="feedback"
													/>
													<FormErrorMessage>
														{form.errors.feedback}
													</FormErrorMessage>
												</FormControl>
											)}
										</Field>
									</chakra.div>
									<ModalFooter pr="0">
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
											Send feedback
										</Button>
									</ModalFooter>
								</Form>
							);
						}}
					</Formik>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default memo(FeedbackDialog);
