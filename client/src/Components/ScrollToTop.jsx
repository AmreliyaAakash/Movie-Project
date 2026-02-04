import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Immediate scroll
        window.scrollTo(0, 0);

        // Enforce instant scroll for immediate visual feedback
        try {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'instant',
            });
        } catch (error) {
            // Fallback for older browsers
            window.scrollTo(0, 0);
        }

        // Small timeout to handle potential race conditions with layout updates
        // especially if new page content causes reflow
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);

        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
