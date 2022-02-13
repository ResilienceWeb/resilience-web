import Head from 'next/head';
import type { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { SessionProvider } from 'next-auth/react';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '../styles/colors.css';
import '../styles/styles.global.scss';
import StoreProvider from '@store/StoreProvider';

const theme = extendTheme({
	styles: {
		global: {
			'button:focus': {
				boxShadow: 'none !important',
			},
			'input:focus': {
				boxShadow: 'none !important',
			},
		},
	},
	colors: {
		rw: {
			700: '#3A8159',
			900: '#09622f'
		}
	}
});

const queryClient = new QueryClient();

function SafeHydrate({ children }) {
	// This prevents the app from rendering on the server
	return (
		<div suppressHydrationWarning>
			{typeof window === 'undefined' ? null : children}
		</div>
	);
}

function App({ Component, pageProps }: AppProps) {
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
				<script
					async
					defer
					src="https://cabin.cambridgeresilienceweb.org.uk/hello.js"
				></script>
			</Head>
			<SafeHydrate>
				<SessionProvider
					refetchInterval={5 * 60}
					session={pageProps.session}
				>
					<ChakraProvider theme={theme}>
						<QueryClientProvider client={queryClient}>
							<StoreProvider>
								<Component {...pageProps} />
							</StoreProvider>
							<ReactQueryDevtools initialIsOpen={false} />
						</QueryClientProvider>
					</ChakraProvider>
				</SessionProvider>
			</SafeHydrate>
		</>
	);
}

export default App;
