/* eslint-disable react/no-unescaped-entities */
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
} from '@chakra-ui/react';

const MobileWarningDialog = () => (
	<Modal closeOnEsc={false} closeOnOverlayClick={false} isOpen isCentered>
		<ModalOverlay />
		<ModalContent mx={3}>
			<ModalHeader>Sorry</ModalHeader>
			<ModalBody mb={5}>
				This app isn't currently supported on mobile. Please try again
				on a laptop or a tablet in landscape mode.
			</ModalBody>
		</ModalContent>
	</Modal>
);

export default MobileWarningDialog;
