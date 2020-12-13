import React from 'react';
import PropTypes from 'prop-types';

import styles from './InfoBox.module.scss';

const InfoBox = ({ title }) => {
	return (
		<div className={styles.root}>
			<p className={styles.title}>{title}</p>
			<p>website.com</p>
			<p>more info...</p>
		</div>
	);
};

InfoBox.propTypes = {
	title: PropTypes.string.isRequired,
};

export default InfoBox;
