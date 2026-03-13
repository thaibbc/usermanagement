import { useState, useEffect } from 'react';

const useBreakpoint = () => {
    const [breakpoint, setBreakpoint] = useState('desktop');

    useEffect(() => {
        const updateBreakpoint = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setBreakpoint('mobile');
            } else if (width < 1024) {
                setBreakpoint('tablet');
            } else {
                setBreakpoint('desktop');
            }
        };

        updateBreakpoint();
        window.addEventListener('resize', updateBreakpoint);
        return () => window.removeEventListener('resize', updateBreakpoint);
    }, []);

    return breakpoint;
};

export default useBreakpoint;