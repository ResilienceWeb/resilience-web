import { useRef, useState, memo } from 'react';
import Image from 'next/image';
import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	InputGroup,
	Button,
	VisuallyHidden,
	chakra,
	Flex,
	Stack,
	Icon,
	Text,
} from '@chakra-ui/react';

const ImageUpload = ({ field, form, formProps }) => {
	const fileInputRef = useRef();
	const [preview, setPreview] = useState();

	const hasImageAlready = field.value && !field.value.name;

	return (
		<FormControl isInvalid={form.errors.image && form.touched.image}>
			<FormLabel htmlFor="image" fontSize="sm">
				Cover image
			</FormLabel>
			<InputGroup
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
				<VisuallyHidden>
					<input
						type="file"
						accept="image/*"
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
					/>
				</VisuallyHidden>

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
					<Flex
						mt={1}
						justify="center"
						px={6}
						pt={5}
						pb={6}
						borderWidth={2}
						borderColor="gray.300"
						borderStyle="dashed"
						rounded="md"
						cursor="pointer"
						onClick={() => fileInputRef.current.click()}
					>
						<Stack spacing={1} textAlign="center">
							<Icon
								mx="auto"
								boxSize={12}
								color="gray.400"
								stroke="currentColor"
								fill="none"
								viewBox="0 0 48 48"
								aria-hidden="true"
							>
								<path
									d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</Icon>
							<Flex
								fontSize="sm"
								color="gray.600"
								alignItems="baseline"
							>
								<chakra.label
									htmlFor="file-upload"
									cursor="pointer"
									rounded="md"
									fontSize="md"
									color="brand.600"
									pos="relative"
									_hover={{
										color: 'brand.400',
									}}
								>
									<span>Upload a file</span>
									<VisuallyHidden>
										<input
											id="file-upload"
											name="file-upload"
											type="file"
										/>
									</VisuallyHidden>
								</chakra.label>
								<Text pl={1}>or drag and drop</Text>
							</Flex>
						</Stack>
					</Flex>
				)}

				{!preview && hasImageAlready && (
					<Button
						position="absolute"
						colorScheme="blue"
						size="sm"
						opacity="0.8"
						onClick={() => fileInputRef.current.click()}
					>
						Replace image
					</Button>
				)}
			</InputGroup>
			<FormErrorMessage>{form.errors.image}</FormErrorMessage>
		</FormControl>
	);
};

export default memo(ImageUpload);
