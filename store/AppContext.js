import { createContext } from 'react';

export const AppContext = createContext({
	isMobile: false,
	isFeedbackDialogOpen: false,
	toggleFeedbackDialog: () => {},
});
