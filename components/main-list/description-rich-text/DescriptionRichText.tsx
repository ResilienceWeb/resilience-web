import { memo } from 'react';
import styles from './DescriptionRichText.module.scss';

const DescriptionRichText = ({ html }) => {
    return (
        <div
            className={styles.description}
            dangerouslySetInnerHTML={{
                __html: html,
            }}
        ></div>
    );
};

export default memo(DescriptionRichText);

