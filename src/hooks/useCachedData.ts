import { useRef, useEffect, useState } from 'react';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

/**
 * In-memory cache for data fetching
 * Persists across component mount/unmount
 */
const globalCache = new Map<string, CacheEntry<unknown>>();

/**
 * Hook to cache API responses and avoid redundant fetches
 * @param key Unique cache key for this data
 * @param fetcher Async function that fetches the data
 * @param ttlMs Time-to-live in milliseconds (default 5 minutes)
 * @returns Object with data, loading, and error states
 */
export function useCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 5 * 60 * 1000 // 5 min default
): { data: T | null; loading: boolean; error: string | null } {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchAbortRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        const fetchData = async () => {
            const now = Date.now();
            const cached = globalCache.get(key);

            // Return cached data if still valid
            if (cached && now - cached.timestamp < cached.ttl) {
                if (isMountedRef.current) {
                    setData(cached.data as T);
                    setLoading(false);
                }
                return;
            }

            if (isMountedRef.current) {
                setLoading(true);
                setError(null);
            }

            fetchAbortRef.current = new AbortController();

            try {
                const result = await fetcher();
                globalCache.set(key, { data: result, timestamp: now, ttl: ttlMs });
                
                if (isMountedRef.current) {
                    setData(result);
                    setError(null);
                }
            } catch (err: unknown) {
                const error = err instanceof Error ? err.message : 'Failed to fetch data';
                const isAborted = err instanceof Error && err.name === 'AbortError';
                if (!isAborted && isMountedRef.current) {
                    setError(error);
                    setData(null);
                }
            } finally {
                if (isMountedRef.current) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMountedRef.current = false;
            fetchAbortRef.current?.abort();
        };
    }, [key, fetcher, ttlMs]);

    return { data, loading, error };
}

/**
 * Clear a specific cache entry
 */
export function clearCache(key: string) {
    globalCache.delete(key);
}

/**
 * Clear all cached data
 */
export function clearAllCache() {
    globalCache.clear();
}
