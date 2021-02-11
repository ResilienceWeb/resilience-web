import React from 'react';
import styles from './SisterGraphLink.module.scss';

const SisterGraphLink = () => (
	<div className={styles.root}>
		<a
			href="https://lm687.shinyapps.io/code/"
			rel="noreferrer"
			target="_blank"
		>
			See the equivalent map for University of Cambridge
		</a>
	</div>
);

export default SisterGraphLink;
