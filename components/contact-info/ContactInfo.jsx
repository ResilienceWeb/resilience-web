import React from 'react';
import styles from './ContactInfo.module.scss';

const ContactInfo = () => (
	<div className={styles.root}>
		<a
			href="mailto:ismail.diner@gmail.com"
			rel="noreferrer"
			target="_blank"
		>
			Feedback
		</a>
	</div>
);

export default ContactInfo;
