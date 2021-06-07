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
	Icon,
	Stack,
	Link,
	chakra,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { SiFacebook, SiInstagram, SiTwitter } from 'react-icons/si';

const Dialog = ({ isOpen, item, onClose }) => {
	return (
		<Modal isCentered isOpen={isOpen} onClose={onClose} size="xl">
			<ModalOverlay />
			<ModalContent opacity="1" mx={2}>
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

				<ModalFooter justifyContent="space-between">
					<Stack direction="row" spacing={4}>
						{item.facebook && (
							<Link href={item.facebook} target="_blank">
								<Icon
									as={SiFacebook}
									color="gray.600"
									cursor="pointer"
									w={8}
									h={8}
									transition="color 150ms"
									_hover={{ color: 'gray.500' }}
								/>
							</Link>
						)}
						{item.twitter && (
							<Link href={item.twitter} target="_blank">
								<Icon
									as={SiTwitter}
									color="gray.600"
									cursor="pointer"
									w={8}
									h={8}
									transition="color 150ms"
									_hover={{ color: 'gray.500' }}
								/>
							</Link>
						)}
						{item.instagram && (
							<Link href={item.instagram} target="_blank">
								<Icon
									as={SiInstagram}
									color="gray.600"
									cursor="pointer"
									w={8}
									h={8}
									transition="color 150ms"
									_hover={{ color: 'gray.500' }}
								/>
							</Link>
						)}
					</Stack>
					<Button colorScheme="blue" mr={3} onClick={onClose}>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default Dialog;
