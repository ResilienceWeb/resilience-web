import classnames from 'classnames';
import { Box, SlideFade, useBreakpointValue } from '@chakra-ui/react';
import Nav from '@components/nav';
import Footer from '@components/footer';
import styles from './Layout.module.scss';

const Layout = ({ applyPostStyling, children }) => {
	return (
		<>
			<Nav />
			<SlideFade in>
				<Box
					className={classnames(applyPostStyling && styles.root)}
					mt="1rem"
					minHeight={useBreakpointValue({
						base: 'calc(100vh - 186px)',
						lg: 'calc(100vh - 140px)',
					})}
				>
					{children}
				</Box>
			</SlideFade>
			<Footer />
		</>
	);
};

export default Layout;
