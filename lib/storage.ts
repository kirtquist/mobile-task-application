import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../api/tasks'

// Cross-platform storage helpers (web -> localStorage, native -> SecureStore)
const getItem = async (key: string) => {
    if (Platform.OS === 'web') {
        try {
            return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
        } catch {
            return null;
        }
    }
    try {
        return await SecureStore.getItemAsync(key);
    } catch {
        return null;
    }
};

const setItem = async (key: string, value: string) => {
    if (Platform.OS === 'web') {
        try {
            if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
            return;
        } catch { /* ignore */ }
    } else {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch { /* ignore */ }
    }
};

export const apiFetch = async <T = any>(
    endpoint: string,
    options: ApiFetchOptions = {}
): Promise<T> => {
    const token = await getItem('access_token');

    if (!BASE_URL) {
        throw new Error('🚨 VITE_API_URL (BASE_URL) is undefined!');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (response.status === 401) {
        const refreshToken = await getItem('refresh_token');

        if (refreshToken) {
            const refreshResponse = await fetch(`${BASE_URL}/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                if (data?.access) {
                    await setItem('access_token', data.access);

                    // Retry original request with new access token
                    const retry = await fetch(`${BASE_URL}${endpoint}`, {
                        ...options,
                        headers: {
                            Authorization: `Bearer ${data.access}`,
                            'Content-Type': 'application/json',
                            ...options.headers,
                        },
                    });

                    if (!retry.ok) {
                        const msg = await retry.text().catch(() => '');
                        throw new Error(`Request failed after refresh: ${retry.status} ${msg}`);
                    }
                    return (await retry.json()) as T;
                }
            }
        }
    }

    if (!response.ok) {
        const msg = await response.text().catch(() => '');
        throw new Error(`Request failed: ${response.status} ${msg}`);
    }

    return (await response.json()) as T;
};

