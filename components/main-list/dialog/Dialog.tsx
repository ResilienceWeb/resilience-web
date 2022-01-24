import { memo, useCallback, useMemo } from 'react';
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
	useToast,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { SiFacebook, SiInstagram, SiTwitter } from 'react-icons/si';
import { HiUserGroup } from 'react-icons/hi';
import { GiNightSleep } from 'react-icons/gi';
import { BsFillShareFill } from 'react-icons/bs';
import { sanitizeLink } from '@helpers/utils';
import { REMOTE_URL } from '@helpers/config';
import DescriptionRichText from '@components/main-list/description-rich-text';

const Dialog = ({ isOpen, isMobile, item, onClose }: { isOpen: boolean, isMobile?: boolean, item: any, onClose: () => void }) => {
	const toast = useToast();

	const websiteSanitized = useMemo(
		() => sanitizeLink(item.website),
		[item.website],
	);

	const showCopiedToClipboardToast = useCallback(() => {
		toast({
			title: 'Copied to clipboard',
			description:
				'The link to this listing is now in your clipboard and ready to be shared.',
			status: 'info',
			duration: 4000,
		});
	}, [toast]);

	const handleShareButtonClick = useCallback(() => {
		navigator.clipboard.writeText(`${REMOTE_URL}/city/${item.slug}`);
		showCopiedToClipboardToast();
	}, [item.slug, showCopiedToClipboardToast]);

	return (
		<Modal
			isCentered={!isMobile}
			isOpen={isOpen}
			onClose={onClose}
			size={isMobile ? 'full' : 'xl'}
		>
			<ModalOverlay />
			<ModalContent opacity="1">
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
					<Flex justifyContent="space-between">
						<Tag
							mb={4}
							backgroundColor={item.color}
							userSelect="none"
						>
							{item.category}
						</Tag>
						<Icon
							as={BsFillShareFill}
							cursor="pointer"
							fontSize="2xl"
							onClick={handleShareButtonClick}
						/>
					</Flex>
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
					<Box mt={4}>
						<DescriptionRichText html={item.description} />
					</Box>
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