import React from 'react';
import Image from 'next/image';
import styles from './Footer.module.scss';

const Footer = () => {
	return (
		<a
			href="https://vercel.com?utm_source=cambridge-resilience-web&utm_campaign=oss"
			rel="noreferrer"
			target="_blank"
		>
			<div className={styles.root}>
				<span>Powered by</span>

				<Image
					alt="Powered by Vercel"
					src="/vercel.svg"
					width="85"
					height="19"
				/>
			</div>
		</a>
	);
};

export default Footer;
