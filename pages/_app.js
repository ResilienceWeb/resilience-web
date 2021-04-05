import Head from 'next/head';
import PropTypes from 'prop-types';
import { ChakraProvider } from '@chakra-ui/react';
import '@fontsource/lato';
import '@fontsource/karla';
import '../styles/globals.css';

function SafeHydrate({ children }) {
	// This prevents the app from rendering on the server
	return (
		<div suppressHydrationWarning>
			{typeof window === 'undefined' ? null : children}
		</div>
	);
}
SafeHydrate.propTypes = {
	children: PropTypes.node,
};

function App({ Component, pageProps }) {
	return (
		<>
			<Head>
				<title>Cambridge Resilience Web</title>
				<meta property="og:title" content="Cambridge Resilience Web" />
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap"
					rel="stylesheet"
				/>
				<meta
					property="og:description"
					content="A web of connections, showing local groups working to co-create a more socially and environmentally just city."
				/>
				<meta
					name="description"
					content="A web of connections, showing local groups working to co-create a more socially and environmentally just city."
				/>
				<meta name="og:image" content="static/preview-image.png" />
				<link
					rel="stylesheet"
					type="text/css"
					href="https://unpkg.com/vis-network/styles/vis-network.min.css"
				/>
				<script async src="https://cdn.splitbee.io/sb.js"></script>
			</Head>
			<SafeHydrate>
				<ChakraProvider>
					<Component {...pageProps} />
				</ChakraProvider>
			</SafeHydrate>
		</>
	);
}

App.propTypes = {
	Component: PropTypes.any,
	pageProps: PropTypes.any,
};

export default App;
