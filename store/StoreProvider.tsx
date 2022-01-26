import React from 'react';
import { useIsMobile } from '@hooks/application';
import { AppContext } from '@store/AppContext';

const StoreProvider = ({ children }) => {
	const { isMobile } = useIsMobile();

	return (
		<AppContext.Provider value={{ isMobile }}>
			{children}
		</AppContext.Provider>
	);
};

export default StoreProvider;
