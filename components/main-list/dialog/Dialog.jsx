import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Button,
	Box,
	Tag,
	chakra,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const Dialog = ({ isOpen, item, onClose }) => {
	return (
		<Modal isCentered isOpen={isOpen} onClose={onClose} size="xl">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>{item.label}</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Tag mb={4} backgroundColor={item.color}>
						{item.category}
					</Tag>
					<br />
					<chakra.a
						color="blue.400"
						href={item.website}
						rel="noreferrer"
						target="_blank"
					>
						{item.website} <ExternalLinkIcon ml={1} />
					</chakra.a>
					<Box mt={4}>{item.description}</Box>
				</ModalBody>

				<ModalFooter>
					<Button colorScheme="blue" mr={3} onClick={onClose}>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default Dialog;
