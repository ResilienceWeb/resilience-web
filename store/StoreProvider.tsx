import React from 'react';
import { useMediaQuerySSR } from '@hooks/application';
import { AppContext } from '@store/AppContext';

const StoreProvider = ({ children }) => {
	const isMobile = useMediaQuerySSR('(max-width: 760px)');

	return (
		<AppContext.Provider value={{ isMobile }}>
			{children}
		</AppContext.Provider>
	);
};

export default StoreProvider;

