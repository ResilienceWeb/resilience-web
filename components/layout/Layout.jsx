import classnames from 'classnames';
import { Flex, SlideFade, useBreakpointValue } from '@chakra-ui/react';
import Nav from '@components/nav';
import Footer from '@components/footer';
import styles from './Layout.module.scss';

const Layout = ({ applyPostStyling, children }) => {
	return (
		<>
			<Nav />
			<SlideFade in>
				<Flex
					className={classnames(applyPostStyling && styles.root)}
					mt="1rem"
					minHeight={useBreakpointValue({
						base: 'calc(100vh - 186px)',
						lg: 'calc(100vh - 140px)',
					})}
					alignItems="center"
					flexDirection="column"
				>
					{children}
				</Flex>
			</SlideFade>
			<Footer />
		</>
	);
};

export default Layout;
