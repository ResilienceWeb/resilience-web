import React from 'react';
import styles from './ContactInfo.module.scss';

const ContactInfo = () => (
	<div className={styles.root}>
		<a
			href="mailto:cambridgeresilienceweb@gmail.com"
			rel="noreferrer"
			target="_blank"
		>
			Make a suggestion
		</a>
	</div>
);

export default ContactInfo;
