import { useState, useEffect } from 'react';

const MOBILE_MATCH_MEDIA = 'only screen and (max-width: 760px)';

export default function useIsMobile() {
	const [isMobile, setIsMobile] = useState(
		window ? window.matchMedia(MOBILE_MATCH_MEDIA).matches : false,
	);
	const handleResize = () => {
		setIsMobile(window.matchMedia(MOBILE_MATCH_MEDIA).matches);
	};
	useEffect(() => {
		window.addEventListener('resize', handleResize, false);
	}, []);

	return { isMobile };
}
