import { useState, useEffect } from 'react';

/**
 * Simple hook that returns whether the viewport is narrower than the given breakpoint.
 * Default breakpoint is 1350px (custom responsive threshold).
 *
 * Usage:
 *   const isMobile = useIsMobile();
 *   const isTablet = useIsMobile(1024);
 */
export default function useIsMobile(breakpoint = 1350) {
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
    );

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isMobile;
}
