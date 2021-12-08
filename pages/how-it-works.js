import { NextSeo } from 'next-seo';
import Image from 'next/image';
import {
	Box,
	Heading,
	chakra,
	useColorModeValue,
	SimpleGrid,
} from '@chakra-ui/react';
import crwScreenshot1 from '../public/crw-screenshot-1.png';
import crwScreenshot2 from '../public/crw-screenshot-2.png';

import Layout from '@components/layout';

const HowItWorks = () => {
	return (
		<>
			<NextSeo
				title="How it works | Cambridge Resilience Web"
				description="Two webs of resilience, showing the environmental and social justice groups in Cambridge"
				openGraph={{
					title: 'How it works | Cambridge Resilience Web',
					description:
						'Two webs of resilience, showing the environmental and social justice groups in Cambridge',
					// images: [{ url: 'https://cckitchen.uk/cck-preview.png' }],
					url: 'https://cambridgeresilienceweb.org.uk/about',
				}}
			/>
			<Layout applyPostStyling>
				<Box p={4} maxW={'5xl'}>
					<Heading as="h1" mb={8}>
						How it works
					</Heading>
					<Features />
				</Box>
			</Layout>
		</>
	);
};

function Features() {
	return (
		<>
			<SimpleGrid
				alignItems="start"
				columns={{ base: 1, md: 2 }}
				mb={24}
				spacingY={{ base: 10, md: 32 }}
				spacingX={{ base: 10, md: 24 }}
			>
				<Image
					src={crwScreenshot1}
					alt="Screenshot of the admin dashboard of Cambridge Resilience Web"
				/>
				<Box>
					<chakra.h2
						mb={4}
						fontSize={{ base: '2xl', md: '4xl' }}
						fontWeight="extrabold"
						textAlign={{ base: 'center', md: 'left' }}
						color="gray.900"
						lineHeight={{ md: 'shorter' }}
					>
						Listings are maintained by people from each group
					</chakra.h2>
					<chakra.p
						mb={5}
						textAlign={{ base: 'center', sm: 'left' }}
						color="gray.600"
						fontSize={{ md: 'lg' }}
					>
						As an editor, you can edit your listing's details, cover
						image, maintain a personalised page and even request
						volunteers. New features are added every month.
					</chakra.p>
				</Box>
			</SimpleGrid>
			<SimpleGrid
				alignItems="start"
				columns={{ base: 1, md: 2 }}
				flexDirection="column-reverse"
				mb={24}
				spacingY={{ base: 10, md: 32 }}
				spacingX={{ base: 10, md: 24 }}
			>
				<Image src={crwScreenshot2} alt="" />
				<Box>
					<chakra.h2
						mb={4}
						fontSize={{ base: '2xl', md: '4xl' }}
						fontWeight="extrabold"
						letterSpacing="tight"
						textAlign={{ base: 'center', md: 'left' }}
						color={useColorModeValue('gray.900', 'gray.400')}
						lineHeight={{ md: 'shorter' }}
					>
						Website visitors then are able to find groups to get
						involved with
					</chakra.h2>
					<chakra.p
						mb={5}
						textAlign={{ base: 'center', sm: 'left' }}
						color={useColorModeValue('gray.600', 'gray.400')}
						fontSize={{ md: 'lg' }}
					>
						With the help of categorization and the filtering
						features, anyone can easily find and get in touch with
						any group on our platform.
					</chakra.p>
				</Box>
			</SimpleGrid>
		</>
	);
}

export default HowItWorks;
