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

export default function SmallWithNavigation() {
	return (
		<Box
			bg={useColorModeValue('gray.50', 'gray.900')}
			color={useColorModeValue('gray.700', 'gray.200')}
		>
			<Container
				as={Stack}
				maxW={'6xl'}
				py={4}
				direction={{ base: 'column', md: 'row' }}
				spacing={4}
				justify={{ base: 'center', md: 'space-between' }}
				align={{ base: 'center', md: 'center' }}
			>
				<Stack direction={'row'} spacing={6}>
					<Link href="https://github.com/Cambridge-Resilience-Web/cambridge-resilience-web">
						Github
					</Link>
				</Stack>
				<Flex alignItems="center">
					<Text mr={1}>Powered by</Text>
					<Image
						alt="Powered by Vercel"
						src="/vercel.svg"
						width="85"
						height="19"
					/>
				</Flex>
			</Container>
		</Box>
	);
}
