import { useRef, useState, memo } from 'react';
import Image from 'next/image';
import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	InputGroup,
	Icon,
} from '@chakra-ui/react';
import { IoImageOutline } from 'react-icons/io5';

const ImageUpload = ({ field, form, formProps }) => {
	const fileInputRef = useRef();
	const [preview, setPreview] = useState();

	return (
		<FormControl isInvalid={form.errors.image && form.touched.image}>
			<FormLabel htmlFor="image">Upload image</FormLabel>
			<InputGroup>
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
							const reader = new FileReader();
							reader.readAsDataURL(file);
							reader.onloadend = () => {
								setPreview(reader.result);
							};

							formProps.setFieldValue('image', file);
						} else {
							setPreview(null);
						}
					}}
				></input>
				{preview ? (
					<div style={{ width: '130px', height: '130px' }}>
						<Image
							alt="Preview of file uploaded by user"
							src={preview}
							layout="fill"
							objectFit="contain"
						/>
					</div>
				) : (
					<Icon
						as={IoImageOutline}
						onClick={() => fileInputRef.current.click()}
						w={100}
						h={100}
						cursor="pointer"
						transition="color 100ms"
						_hover={{ color: '#4a9e7f' }}
					/>
				)}
			</InputGroup>
			<FormErrorMessage>{form.errors.image}</FormErrorMessage>
		</FormControl>
	);
};

export default memo(ImageUpload);
