import React from 'react';
import Image from 'next/image';
import styles from './Footer.module.scss';

const Footer = () => {
	return (
		<div className={styles.root}>
			<span>Powered by</span>
			<Image
				alt="Powered by Vercel"
				src="/vercel.svg"
				width="85"
				height="19"
			/>
		</div>
	);
};

export default Footer;
