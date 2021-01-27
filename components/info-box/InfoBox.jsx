import React from 'react';
import PropTypes from 'prop-types';

import styles from './InfoBox.module.scss';

const InfoBox = ({ title, website }) => {
	return (
		<div className={styles.root}>
			<h1 className={styles.title}>{title}</h1>
			{website && (
				<a className={styles.website} href={website}>
					{website}
				</a>
			)}
		</div>
	);
};

InfoBox.propTypes = {
	title: PropTypes.string.isRequired,
	website: PropTypes.string,
};

export default InfoBox;
