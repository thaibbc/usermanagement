// Tạo file mới: useIsTablet.js
import { useState, useEffect } from 'react';

export default function useIsTablet(breakpoint = 1024) {
    const [isTablet, setIsTablet] = useState(
        typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
    );

    useEffect(() => {
        const handleResize = () => {
            setIsTablet(window.innerWidth < breakpoint);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isTablet;
}