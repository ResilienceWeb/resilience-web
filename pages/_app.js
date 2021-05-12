import Head from 'next/head';
import PropTypes from 'prop-types';
import '@progress/kendo-theme-default/dist/all.css';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { Provider } from 'next-auth/client';
import '@fontsource/montserrat';
import '@fontsource/karla/400.css';
import '../styles/globals.css';

const queryClient = new QueryClient();

function SafeHydrate({ children }) {
	// This prevents the app from rendering on the server
	return (
		<div suppressHydrationWarning>
			{typeof window === 'undefined' ? null : children}
		</div>
	);
}

function App({ Component, pageProps }) {
	return (
		<>
			<Head>
				<title>Cambridge Resilience Web</title>
				<meta property="og:title" content="Cambridge Resilience Web" />
				<meta charSet="utf-8" />
				<meta property="og:locale" content="en_GB" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
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
					rel="shortcut icon"
					href="/favicon.ico"
					type="image/x-icon"
				/>
				<link rel="icon" href="/favicon.ico" type="image/x-icon" />
				<link
					rel="stylesheet"
					type="text/css"
					href="https://unpkg.com/vis-network/styles/vis-network.min.css"
				/>
				<script
					async
					defer
					src="https://scripts.withcabin.com/hello.js"
				></script>
				{/* <link
					href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
					rel="stylesheet"
					integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
					crossOrigin="anonymous"
				></link> */}
			</Head>
			<SafeHydrate>
				<Provider
					options={{ clientMaxAge: 0, keepAlive: 0 }}
					session={pageProps.session}
				>
					<ChakraProvider>
						<QueryClientProvider client={queryClient}>
							<Component {...pageProps} />
						</QueryClientProvider>
					</ChakraProvider>
				</Provider>
			</SafeHydrate>
		</>
	);
}

App.propTypes = {
	Component: PropTypes.any,
	pageProps: PropTypes.any,
};

export default App;
