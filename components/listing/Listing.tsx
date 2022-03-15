import { memo, useContext, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
	Box,
	Heading,
	useBreakpointValue,
	Flex,
	Image,
	Tag,
	Stack,
	HStack,
	Link,
	Icon,
	Button,
	Text,
	Tooltip,
} from '@chakra-ui/react';
import { SiFacebook, SiInstagram, SiTwitter } from 'react-icons/si';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { HiEye, HiShare, HiArrowLeft, HiUserGroup } from 'react-icons/hi';
import { FaDirections } from 'react-icons/fa';
import DescriptionRichText from '@components/main-list/description-rich-text';
import { AppContext } from '@store/AppContext';

function Listing({ listing }) {
	const router = useRouter();
	const { isMobile } = useContext(AppContext);

	const goBack = useCallback(() => {
		router.back();
	}, [router]);

	return (
		<>
			<Box
				maxWidth={useBreakpointValue({
					base: '100%',
					md: '800px',
				})}
			>
				<Button
					leftIcon={<HiArrowLeft />}
					name="Back"
					mb={2}
					ml={2}
					onClick={goBack}
					variant="link"
					color="black"
				>
					Back
				</Button>
				<Image
					src={listing.image}
					alt={`Image for article Title`}
					borderLeftRadius={!isMobile ? 'lg' : undefined}
					boxSize={useBreakpointValue({
						base: '100%',
						md: '800px',
					})}
					maxHeight="400px"
					maxWidth="948px"
					objectFit="cover"
					borderRadius="lg"
				/>
				<Flex
					flexDirection={useBreakpointValue({
						base: 'column',
						md: 'row',
					})}
					width="100%"
					mb={useBreakpointValue({
						base: 6,
						md: 10,
					})}
					py={4}
				>
					<Box
						display="flex"
						flexDirection="column"
						justifyContent="space-between"
						width="100%"
					>
						<Box>
							<Heading as="h1" data-testid="Title" pb={2}>
								{listing.title}
							</Heading>
							<HStack justifyContent="space-between">
								<Tag
									mb={2}
									backgroundColor={`#${listing.category.color}`}
									userSelect="none"
									size="md"
								>
									{listing.category.label}
								</Tag>
								{listing.seekingVolunteers && (
									<Tooltip label="This group is seeking volunteers or members. Get in touch with them if you'd like to help.">
										<Text color="rw.900">
											<Icon as={HiUserGroup} /> Seeking
											volunteers
										</Text>
									</Tooltip>
								)}
							</HStack>
						</Box>
						{/* <Flex
							mt="4"
							alignItems="center"
							justifyContent="space-between"
						>
							<Text
								color="gray.500"
								fontWeight="semibold"
								fontSize="xs"
								ml="2"
							>
								Added addedDateDescription
							</Text>
						</Flex> */}
						<Box
							display={useBreakpointValue({
								base: 'flex',
								md: 'block',
							})}
							justifyContent="space-between"
						>
							<Stack direction="row" spacing={4} mt={8}>
								<Link
									href={listing.website}
									rel="noreferrer"
									target="_blank"
								>
									<Button
										size="md"
										bg="rw.700"
										colorScheme="rw.700"
										rightIcon={<ExternalLinkIcon />}
										_hover={{ bg: 'rw.900' }}
									>
										Visit website
									</Button>
								</Link>
								{listing.facebook && (
									<Link
										href={listing.facebook}
										target="_blank"
									>
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
								{listing.twitter && (
									<Link
										href={listing.twitter}
										target="_blank"
									>
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
								{listing.instagram && (
									<Link
										href={listing.instagram}
										target="_blank"
									>
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
						</Box>
					</Box>
				</Flex>
				<Box>
					<DescriptionRichText html={listing.description} />
				</Box>
			</Box>
			{/* <Flex
				justifyContent="center"
				mt={useBreakpointValue({ base: '-1rem', md: '0' })}
			>
				<Box
					background="white"
					maxWidth={useBreakpointValue({
						base: '100%',
						md: '800px',
					})}
					mb={useBreakpointValue({ base: 0, md: 8 })}
					borderRadius={useBreakpointValue({
						base: 0,
						md: '0.375rem',
					})}
					boxShadow={useBreakpointValue({
						base: 'none',
						md: 'lg',
					})}
				>
					<Image
						alt={`${listing.title} cover image`}
						src={listing.image}
						display={listing.image ? 'block' : 'none'}
						objectFit="cover"
						width="100%"
						maxHeight="300px"
						borderTopRadius={useBreakpointValue({
							base: 0,
							md: '0.375rem',
						})}
					/>
					<Box p={useBreakpointValue({ base: 4, md: 8 })}>
						<Flex
							direction="column"
							justifyContent="center"
							alignItems="center"
						>
							<Heading as="h1" mb={4} textAlign="center">
								{listing.title}
							</Heading>
							<Tag
								mb={8}
								backgroundColor={`#${listing.category.color}`}
								userSelect="none"
								size="lg"
							>
								{listing.category.label}
							</Tag>
						</Flex>

						<DescriptionRichText html={listing.description} />

						<Flex mt={8} justifyContent="center">
							<Link
								href={listing.website}
								rel="noreferrer"
								target="_blank"
							>
								<Button
									size="lg"
									bg="rw.700"
									colorScheme="rw.700"
									_hover={{ bg: 'rw.900' }}
								>
									Visit website
								</Button>
							</Link>
						</Flex>

						<Stack
							direction="row"
							justifyContent="center"
							spacing={4}
							mt={8}
						>
							{listing.facebook && (
								<Link href={listing.facebook} target="_blank">
									<Icon
										as={SiFacebook}
										color="gray.600"
										cursor="pointer"
										w={12}
										h={12}
										transition="color 150ms"
										_hover={{ color: 'gray.500' }}
									/>
								</Link>
							)}
							{listing.twitter && (
								<Link href={listing.twitter} target="_blank">
									<Icon
										as={SiTwitter}
										color="gray.600"
										cursor="pointer"
										w={12}
										h={12}
										transition="color 150ms"
										_hover={{ color: 'gray.500' }}
									/>
								</Link>
							)}
							{listing.instagram && (
								<Link href={listing.instagram} target="_blank">
									<Icon
										as={SiInstagram}
										color="gray.600"
										cursor="pointer"
										w={12}
										h={12}
										transition="color 150ms"
										_hover={{ color: 'gray.500' }}
									/>
								</Link>
							)}
						</Stack>
					</Box>
				</Box>
			</Flex> */}
		</>
	);
}

export default memo(Listing);
