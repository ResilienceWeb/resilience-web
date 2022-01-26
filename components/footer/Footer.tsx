import { useContext } from 'react';
import {
	Box,
	Container,
	Stack,
	Text,
	Link,
	useColorModeValue,
	Flex,
} from '@chakra-ui/react';
import Image from 'next/image';
import { AppContext } from '@store/AppContext';

export default function Footer() {
	const { isMobile } = useContext(AppContext);

	return (
		<Box
			bg={useColorModeValue('white', 'gray.800')}
			color={useColorModeValue('gray.600', 'white')}
			zIndex="6"
		>
			<Container
				as={Flex}
				maxW={'7xl'}
				py={4}
				direction={{ base: 'column', md: 'row' }}
				spacing={4}
				justify={{ base: 'center', md: 'space-between' }}
				align={{ base: 'center', md: 'center' }}
			>
				<Stack
					direction={'row'}
					spacing={6}
					alignItems="center"
					mb={{ base: 4, md: 0 }}
				>
					<Link
						href="https://github.com/Cambridge-Resilience-Web/cambridge-resilience-web"
						target="_blank"
					>
						Github
					</Link>
					<Link
						href="https://opencollective.com/resilience-web/donate"
						target="_blank"
						rel="noreferrer"
					>
						Donate to our collective
						{/* <Image
								alt="Open collective button that says Donate to our collective"
								src="https://opencollective.com/resilience-web/donate/button@2x.png"
								width="300"
								height="50"
							/> */}
					</Link>
				</Stack>
				<Link
					fontWeight="semibold"
					href="https://dinerismail.dev"
					target="_blank"
					isExternal
					_hover={{ color: 'black' }}
				>
					Made with ❤️ by Diner
				</Link>
				{!isMobile && (
					<Flex alignItems="center">
						<Text mr={1}>Powered by</Text>
						<Image
							alt="Powered by Vercel"
							src="/vercel.svg"
							width="85"
							height="19"
						/>
					</Flex>
				)}
			</Container>
		</Box>
	);
}
