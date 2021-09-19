import { useRef, useState, memo } from 'react';
import Image from 'next/image';
import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	InputGroup,
	Button,
} from '@chakra-ui/react';

const ImageUpload = ({ field, form, formProps }) => {
	const fileInputRef = useRef();
	const [preview, setPreview] = useState();

	const hasImageAlready = field.value && !field.value.name;

	return (
		<FormControl isInvalid={form.errors.image && form.touched.image}>
			<FormLabel htmlFor="image">Cover image</FormLabel>
			<InputGroup
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
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

				{hasImageAlready || preview ? (
					<div style={{ width: '200px', height: '200px' }}>
						<Image
							alt="Preview of file uploaded by user"
							src={preview ?? field.value}
							layout="fill"
							objectFit="contain"
						/>
					</div>
				) : (
					<div
						style={{
							width: '250px',
							height: '200px',
							backgroundColor: '#cfcdca',
						}}
					/>
				)}

				{!preview && (
					<Button
						position="absolute"
						colorScheme="blue"
						size="sm"
						opacity="0.8"
						onClick={() => fileInputRef.current.click()}
					>
						{hasImageAlready ? 'Replace image' : 'Upload'}
					</Button>
				)}
			</InputGroup>
			<FormErrorMessage>{form.errors.image}</FormErrorMessage>
		</FormControl>
	);
};

export default memo(ImageUpload);
