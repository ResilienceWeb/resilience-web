import { useRef, useState, memo } from 'react';
import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	InputGroup,
	InputLeftElement,
	Icon,
	Input,
} from '@chakra-ui/react';
import { FiFile } from 'react-icons/fi';

const ImageUpload = ({ field, form, formProps }) => {
	const fileInputRef = useRef();
	const [preview, setPreview] = useState();

	return (
		<FormControl isInvalid={form.errors.image && form.touched.image}>
			<FormLabel htmlFor="image">Upload image</FormLabel>
			<InputGroup>
				<InputLeftElement pointerEvents="none">
					<Icon as={FiFile} />
				</InputLeftElement>
				<input
					type="file"
					accept="image/*"
					style={{
						display: 'none',
					}}
					ref={fileInputRef}
					onChange={(event) => {
						const file = event.target.files[0];
						if (file?.type.substr(0, 5) === 'image') {
							// const reader = new FileReader();
							// reader.onloadend = () => {
							// 	setPreview(reader.result);
							// };
							// reader.readAsDataURL(file);

							formProps.setFieldValue(
								'image',
								event.target.files[0],
							);
						} else {
							setPreview(null);
						}
					}}
				></input>
				<Input
					// {...field}
					placeholder={
						formProps.values.image?.name
							? formProps.values.image.name
							: 'Your file ...'
					}
					onClick={() => fileInputRef.current.click()}
				/>
				{preview && (
					<img
						alt="Preview of file uploaded by user"
						src={preview}
						style={{ objectFit: 'cover' }}
					/>
				)}
			</InputGroup>
			<FormErrorMessage>{form.errors.image}</FormErrorMessage>
		</FormControl>
	);
};

export default memo(ImageUpload);
