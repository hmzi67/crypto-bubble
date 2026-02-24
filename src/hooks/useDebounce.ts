import { useState, useEffect } from 'react';

/**
 * Hook to debounce a value
 * Useful for search inputs and other rapid state changes
 * @param value The value to debounce
 * @param delayMs Delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delayMs: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delayMs);

        return () => clearTimeout(handler);
    }, [value, delayMs]);

    return debouncedValue;
}
