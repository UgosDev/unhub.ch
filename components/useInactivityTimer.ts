import { useEffect, useRef } from 'react';

interface UseInactivityTimerProps {
    enabled: boolean;
    timeoutInMs: number;
    onIdle: () => void;
}

export function useInactivityTimer({ enabled, timeoutInMs, onIdle }: UseInactivityTimerProps) {
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            return;
        }

        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

        const resetTimer = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = window.setTimeout(onIdle, timeoutInMs);
        };

        resetTimer(); // Start the timer initially

        events.forEach(event => window.addEventListener(event, resetTimer));

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [enabled, timeoutInMs, onIdle]);
}