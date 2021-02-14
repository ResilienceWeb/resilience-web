import React from 'react';
import { Flex } from '@chakra-ui/react';
import styles from './LoadingSpinner.module.scss';

const LoadingSpinner = () => (
	<Flex align="center" className={styles.container} justify="center">
		<div className={styles.ldsdefault}>
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
		</div>
	</Flex>
);

export default LoadingSpinner;
