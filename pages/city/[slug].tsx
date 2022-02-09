import { memo } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import {
	Box,
	Heading,
	useBreakpointValue,
	Flex,
	Image,
	Tag,
	Stack,
	Link,
	Icon,
	Button,
} from '@chakra-ui/react';
import { REMOTE_URL } from '@helpers/config';
import Layout from '@components/layout';
import { SiFacebook, SiInstagram, SiTwitter } from 'react-icons/si';
import DescriptionRichText from '@components/main-list/description-rich-text';

function Listing({ listing }) {
	const router = useRouter();
	if (router.isFallback) {
		return (
			<Layout>
				<h1>Please wait…</h1>
			</Layout>
		)
	}

	return (
		<>
			<NextSeo
				title={`${listing.title} | Cambridge Resilience Web`}
				openGraph={{
					title: `${listing.title} | Cambridge Resilience Web`,
					images: [{ url: listing.image }],
					url: `https://cambridgeresilienceweb.org.uk/city/${listing.slug}`,
				}}
			/>
			<Layout>
				<Flex
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
										bg="#57b894"
										colorScheme="#57b894"
										_hover={{ bg: '#4a9e7f' }}
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
									<Link
										href={listing.facebook}
										target="_blank"
									>
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
									<Link
										href={listing.twitter}
										target="_blank"
									>
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
									<Link
										href={listing.instagram}
										target="_blank"
									>
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
				</Flex>
			</Layout>
		</>
	);
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const response = await fetch(`${REMOTE_URL}/api/listing/${params.slug}`);
	const data = await response.json();
	const { listing } = data;

	return {
		props: {
			listing,
		},
		revalidate: 5,
	};
}

export const getStaticPaths : GetStaticPaths = async () => {
	const response = await fetch(`${REMOTE_URL}/api/listings`);
	const data = await response.json();
	const { listings } = data;
	const paths = listings.map((l) => `/city/${l.slug}`);

	return {
		paths,
		fallback: true,
	};
}

export default memo(Listing);
