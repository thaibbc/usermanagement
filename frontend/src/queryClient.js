import { QueryClient } from '@tanstack/react-query';

// create a client with offline‑friendly defaults
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: 1000 * 60 * 60, // keep data fresh for 1h
            cacheTime: 1000 * 60 * 60 * 24, // keep in cache for a day
        }
    }
});

// persist cache to localStorage so it survives reloads/offline
const LOCAL_STORAGE_KEY = 'react_query_cache';
export const localStoragePersistor = {
    persistClient: async (client) => {
        try {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(client));
        } catch {
            // ignore storage write errors (quota, private mode)
        }
    },
    restoreClient: async () => {
        try {
            const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
            return stored ? JSON.parse(stored) : undefined;
        } catch {
            // parsing or access error; treat as empty cache
            return undefined;
        }
    },
    removeClient: async () => {
        try {
            window.localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch {
            // ignore removal errors
        }
    }
};
