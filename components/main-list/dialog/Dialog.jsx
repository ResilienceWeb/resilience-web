import { memo } from 'react';
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Box,
	Tag,
	Icon,
	Stack,
	Link,
	chakra, Flex, Tooltip, Text,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { SiFacebook, SiInstagram, SiTwitter } from 'react-icons/si';
import { HiUserGroup } from 'react-icons/hi';
import { GiNightSleep } from 'react-icons/gi';

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
					{item.seekingVolunteers && (
						<Flex justifyContent={'right'}>
							<Tooltip label="This group is seeking volunteers or members. Get in touch with them if you'd like to help.">
								<Text color="seagreen">
									Seeking volunteers <Icon as={HiUserGroup} />
								</Text>
							</Tooltip>
						</Flex>
					)}
					{item.inactive && (
						<Flex justifyContent={'right'}>
							<Tooltip label="This group is currently inactive.">
								<Text color="grey">
									Currently Inactive <Icon as={GiNightSleep} />
								</Text>
							</Tooltip>
						</Flex>
					)}
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
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default memo(Dialog);
