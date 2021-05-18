import { useRef } from 'react';
import { chakra, Button } from '@chakra-ui/react';
import {
	FieldWrapper,
	Form,
	Field,
	FormElement,
} from '@progress/kendo-react-form';
import { Label, Hint, Error } from '@progress/kendo-react-labels';
import { Input, TextArea } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { Dialog } from '@progress/kendo-react-dialogs';
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

const ListingCreationDialog = ({ itemInEdit, onClose, onSubmit }) => {
	return (
		<Dialog
			autoFocus
			title={itemInEdit ? 'Edit listing' : 'Create new listing'}
			onClose={onClose}
			width={500}
			height={650}
			style={{ zIndex: 100 }}
		>
			<Form
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
				render={(formRenderProps) => (
					<FormElement
						style={{
							maxWidth: 650,
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'space-between',
						}}
					>
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
									style={{ maxHeight: '200px' }}
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
						<Button
							bg="#57b894"
							colorScheme="#57b894"
							disabled={!formRenderProps.allowSubmit}
							size="md"
							type={'submit'}
							_hover={{ bg: '#4a9e7f' }}
						>
							Submit
						</Button>
					</FormElement>
				)}
			/>
		</Dialog>
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
