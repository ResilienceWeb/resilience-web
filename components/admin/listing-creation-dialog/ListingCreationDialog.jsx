import { useRef } from 'react';
import {
	chakra,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
} from '@chakra-ui/react';
import {
	FieldWrapper,
	Form,
	Field,
	FormElement,
} from '@progress/kendo-react-form';
import { Label, Hint, Error } from '@progress/kendo-react-labels';
import { Input, TextArea } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import CATEGORY_MAPPING from '../../../data/enums.js';

const emailRegex = new RegExp(/\S+@\S+\.\S+/);
const emailValidator = (value) =>
	emailRegex.test(value) ? '' : 'Please enter a valid email.';
const EmailInput = (fieldRenderProps) => {
	const { validationMessage, visited, ...others } = fieldRenderProps;
	return (
		<div>
			<Input {...others} />
			{visited && validationMessage && <Error>{validationMessage}</Error>}
		</div>
	);
};

// export const categories = [
// 	'X-Small',
// 	'Small',
// 	'Medium',
// 	'Large',
// 	'X-Large',
// 	'2X-Large',
// ];

const ListingCreationDialog = ({ onClose, onSubmit }) => {
	return (
		<Dialog
			title="Create new listing"
			onClose={onClose}
			width={500}
			height={550}
			style={{ zIndex: 100 }}
		>
			<Form
				onSubmit={onSubmit}
				render={(formRenderProps) => (
					<FormElement style={{ maxWidth: 650 }}>
						<fieldset className={'k-form-fieldset'}>
							<chakra.div mb={3}>
								<Field
									name={'title'}
									component={Input}
									placeholder="Title"
								/>
							</chakra.div>

							<chakra.div mb={3}>
								<Field
									name={'description'}
									component={TextArea}
									placeholder="Description"
								/>
							</chakra.div>

							<chakra.div mb={3}>
								<Field
									data={Object.keys(CATEGORY_MAPPING)}
									name={'category'}
									component={FormDropDownList}
									placeholder="Category"
								/>
							</chakra.div>

							<chakra.div mb={3}>
								<Field
									name={'email'}
									type={'email'}
									component={EmailInput}
									placeholder={'Email'}
									validator={emailValidator}
								/>
							</chakra.div>

							<chakra.div mb={3}>
								<Field
									name={'website'}
									component={Input}
									placeholder="Website"
								/>
							</chakra.div>

							<chakra.div mb={3}>
								<Field
									name={'facebook'}
									component={Input}
									placeholder="Facebook"
								/>
							</chakra.div>

							<chakra.div mb={3}>
								<Field
									name={'twitter'}
									component={Input}
									placeholder="Twitter"
								/>
							</chakra.div>

							<chakra.div mb={3}>
								<Field
									name={'instagram'}
									component={Input}
									placeholder="Instagram"
								/>
							</chakra.div>
						</fieldset>
						<div className="k-form-buttons">
							<button
								type={'submit'}
								className="k-button"
								disabled={!formRenderProps.allowSubmit}
							>
								Submit
							</button>
						</div>
					</FormElement>
				)}
			/>
		</Dialog>
		// <Modal isCentered isOpen={isOpen} onClose={onClose} size="xl">
		// 	<ModalOverlay />
		// 	<ModalContent opacity="1">
		// 		<ModalHeader>Create new listing</ModalHeader>
		// 		<ModalCloseButton />
		// 		<ModalBody>

		// 			{/* <Tag mb={4} backgroundColor={item.color}>
		// 				{item.category}
		// 			</Tag>
		// 			<br />
		// 			<chakra.a
		// 				color="blue.400"
		// 				href={item.website}
		// 				rel="noreferrer"
		// 				target="_blank"
		// 			>
		// 				{item.website} <ExternalLinkIcon ml={1} />
		// 			</chakra.a>
		// 			<Box mt={4}>{item.description}</Box> */}
		// 		</ModalBody>
		// 	</ModalContent>
		// </Modal>
	);
};

export const FormDropDownList = (fieldRenderProps) => {
	const {
		validationMessage,
		touched,
		label,
		id,
		valid,
		disabled,
		hint,
		wrapperStyle,
		...others
	} = fieldRenderProps;
	const editorRef = useRef(null);

	const showValidationMessage = touched && validationMessage;
	const showHint = !showValidationMessage && hint;
	const hintId = showHint ? `${id}_hint` : '';
	const errorId = showValidationMessage ? `${id}_error` : '';
	const labelId = label ? `${id}_label` : '';

	return (
		<FieldWrapper style={wrapperStyle}>
			<Label
				id={labelId}
				editorRef={editorRef}
				editorId={id}
				editorValid={valid}
				editorDisabled={disabled}
			>
				{label}
			</Label>
			<DropDownList
				ariaLabelledBy={labelId}
				ariaDescribedBy={`${hintId} ${errorId}`}
				ref={editorRef}
				valid={valid}
				id={id}
				disabled={disabled}
				{...others}
			/>
			{showHint && <Hint id={hintId}>{hint}</Hint>}
			{showValidationMessage && (
				<Error id={errorId}>{validationMessage}</Error>
			)}
		</FieldWrapper>
	);
};

export default ListingCreationDialog;
