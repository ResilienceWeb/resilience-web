import Head from 'next/head';
import PropTypes from 'prop-types';
import { ChakraProvider } from '@chakra-ui/react';
import '../styles/globals.css';
import 'vis-network/styles/vis-network.css';

function App({ Component, pageProps }) {
	return (
		<>
			<Head>
				<title>Web of Connections</title>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;700&display=swap"
					rel="stylesheet"
				/>
			</Head>
			<ChakraProvider>
				<Component {...pageProps} />
			</ChakraProvider>
		</>
	);
}

App.propTypes = {
	Component: PropTypes.any,
	pageProps: PropTypes.any,
};

export default App;
