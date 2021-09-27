import { memo, useMemo } from 'react';
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
	chakra,
	Flex,
	Tooltip,
	Text,
	Image,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { SiFacebook, SiInstagram, SiTwitter } from 'react-icons/si';
import { HiUserGroup } from 'react-icons/hi';
import { GiNightSleep } from 'react-icons/gi';

const sanitizeLink = (link) => {
	let result = link;
	result = result.replace('https://www.', '');
	result = result.replace('https://', '');
	result = result.replace(/\/$/, '');

	return result;
};

const Dialog = ({ isOpen, item, onClose }) => {
	const websiteSanitized = useMemo(
		() => sanitizeLink(item.website),
		[item.website],
	);

	return (
		<Modal isCentered isOpen={isOpen} onClose={onClose} size="xl">
			<ModalOverlay />
			<ModalContent opacity="1" mx={2}>
				{item.image && (
					<Image
						alt={`${item.label} cover image`}
						src={item.image}
						objectFit="cover"
						width="100%"
						maxHeight="300px"
						borderTopRadius="0.375rem"
					/>
				)}

				<ModalHeader pb={0}>{item.label}</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Tag mb={4} backgroundColor={item.color} userSelect="none">
						{item.category}
					</Tag>
					<br />

					<chakra.a
						color="blue.400"
						href={item.website}
						rel="noreferrer"
						target="_blank"
						verticalAlign="text-bottom"
					>
						{websiteSanitized} <ExternalLinkIcon ml={1} />
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
									Currently inactive{' '}
									<Icon as={GiNightSleep} />
								</Text>
							</Tooltip>
						</Flex>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default memo(Dialog);
