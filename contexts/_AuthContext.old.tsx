// import React, {createContext, useContext, useMemo, useState, useEffect} from 'react';
// import {apiFetch} from '../api/tasks';
// import {useLogout} from "../hooks/useLogout";
//
//
// type AuthValue = {
//     token: string | null;
//     login: (username: string, password: string) => Promise<void>;
//     logout: () => Promise<void> | void;
//     user?: unknown | null;
//     loading?: boolean;
//     error?: string | null;
// };
//
// // Keep the context private to this module
// const InternalAuthContext = createContext<AuthValue | null>(null);
//
// export function AuthProvider({ children }: { children: React.ReactNode }) {
//     // Example skeleton; keep your existing logic here
//     const [token, setToken] = useState<string | null>(null);
//
//     const login = async (username: string, password: string) => {
//         // replace with your real login flow; set token from API response
//         // await api.login(username, password);
//         // setToken('...set-from-api...');
//         setToken(token)
//     };
//
//     const logout = async () => {
//         setToken(null);
//     };
//     const value = useMemo<AuthValue>(() => ({ token, login, logout }), [token]);
//     return <InternalAuthContext.Provider value={value}>{children}</InternalAuthContext.Provider>;
// }
//
// export function useAuth(): AuthValue {
//     const ctx = useContext(InternalAuthContext);
//     if (!ctx) throw new Error('useAuth must be used within <AuthProvider />');
//     return ctx;
// }
//
// // interface AuthContextType {
// //     isAuthenticated: boolean;
// //     user: { username: string; email: string } | null;
// //     login: (username: string, password: string) => Promise<void>;
// //     logout: () => void;
// //     setUser: React.Dispatch<React.SetStateAction<{ username: string; email: string } | null>>;
// //     setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
// // }
// //
// // const AuthContext = createContext<AuthContextType | undefined>(undefined);
// //
// // export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
// //     const [user, setUser] = useState<{ username: string; email: string } | null>(null);
// //     const [isAuthenticated, setIsAuthenticated] = useState(false);
// //     // const logout = useLogout()
// //     // const {clearTasks} = useTasksContext()
// //     const logout = useLogout(setUser, setIsAuthenticated);
// //
// //
// //     useEffect(() => {
// //         const token = localStorage.getItem('access_token');
// //         console.log('Checking auth on page load...', token);
// //
// //         if (token) {
// //             // Optionally: verify token with backend or decode
// //             setIsAuthenticated(true);
// //             // You might want to fetch user info here too
// //             // Fetch user profile to restore state
// //             apiFetch<{ username: string; email: string }>('/me')
// //                 .then((user) => setUser(user))
// //                 .catch(() => {
// //                     // If token is invalid, force logout
// //                     logout();
// //                 });
// //         }
// //     }, []);
//
//
// //     const login = async (username: string, password: string) => {
// //         // Call the real JWT login endpoint
// //         const BASE_URL = "https://task-app-service-backend-426afe5-57fc7zcbta-uw.a.run.app/api";
// //         username = "kirt";
// //         password = "x77tag$$";
// //         console.log(
// //             "BASE_URL:",
// //             BASE_URL)
// //         console.log("username:", username)
// //
// //         const response = await fetch(`${BASE_URL}/token/`, {
// //             method: 'POST',
// //             headers: {
// //                 'Content-Type': 'application/json',
// //             },
// //             body: JSON.stringify({username, password}),
// //
// //         });
// //
// //         if (!response.ok) {
// //             const error = await response.json().catch(() => ({}));
// //             throw new Error(error.detail || 'Login failed');
// //         }
// //
// //         console.log("Awaiting response");
// //         const data = await response.json();
// //
// //         // Store the tokens
// //         localStorage.setItem('access_token', data.access);
// //         localStorage.setItem('refresh_token', data.refresh);
// //
// //         console.log('access_token just set:', localStorage.getItem('access_token'));
// //
// //         const user = await apiFetch<{ username: string; email: string }>('/me'); // <-- change if needed
// //         console.log('User fetched:', user);
// //         setUser(user);
// //         setIsAuthenticated(true);
// //     };
// //
// //
// //     return (
// //         <AuthContext.Provider value={{isAuthenticated, user, login, logout, setUser, setIsAuthenticated}}>
// //             {children}
// //         </AuthContext.Provider>
// //     );
// // };
//
// // export const useAuth = () => {
// //     const context = useContext(AuthContext);
// //     if (!context) throw new Error('useAuth must be used within AuthProvider');
// //     return context;
// // };


import React, {
    createContext,
    useContext,
    useMemo,
    useState,
    useEffect,
} from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { apiFetch } from '../api/tasks';
import { BASE_URL} from "../api/tasks";

type AuthValue = {
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void> | void;
    user?: unknown | null;
    loading?: boolean;
    error?: string | null;
};

// Keep the context private to this module
const InternalAuthContext = createContext<AuthValue | null>(null);

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Cross-platform storage (SecureStore on native, localStorage on web)
const storage = {
    getItemAsync: async (key: string) => {
        if (Platform.OS === 'web') {
            return typeof window !== 'undefined'
                ? window.localStorage.getItem(key)
                : null;
        }
        return await SecureStore.getItemAsync(key);
    },
    setItemAsync: async (key: string, value: string) => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
            return;
        }
        await SecureStore.setItemAsync(key, value);
    },
    deleteItem: async (key: string) => {
        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined') window.localStorage.removeItem(key);
            return;
        }
        await SecureStore.deleteItemAsync(key);
    },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<unknown | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Restore token on app start
    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const t = await storage.getItemAsync('access_token');
                if (alive && t) setToken(t);
                // (optional) hydrate user here, or leave user null
            } catch (e) {
                if (alive) setError(String(e));
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    const login = async (username: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE_URL}/token/`, {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ username, password }),
            });
            if (!res.ok) throw new Error(await res.text());
            const { access, refresh } = await res.json();
            await storage.setItemAsync('access_token', access);
            await storage.setItemAsync('refresh_token', refresh);
            setToken(access);
        } catch (e:any) {
            setError(e?.message ?? 'Login failed');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };
    // const login: AuthValue['login'] = async (username, password) => {
    //     setError(null);
    //     setLoading(true);
    //     try {
    //         const baseUrl =
    //             process.env.EXPO_PUBLIC_API_URL || 'https://<your-api-domain>/api';
    //
    //         const res = await fetch(`${baseUrl}/token/`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ username, password }),
    //         });
    //
    //         if (!res.ok) {
    //             // Try to surface backend error if present
    //             let detail = 'Login failed';
    //             try {
    //                 const data = await res.json();
    //                 detail = data?.detail || detail;
    //             } catch {
    //                 // ignore parse errors
    //             }
    //             throw new Error(detail);
    //         }
    //
    //         const data: { access?: string; refresh?: string } = await res.json();
    //         const access = data.access ?? '';
    //         const refresh = data.refresh ?? '';
    //
    //         if (!access) {
    //             throw new Error('Login response did not include an access token');
    //         }
    //
    //         await storage.setItem(ACCESS_TOKEN_KEY, access);
    //         if (refresh) {
    //             await storage.setItem(REFRESH_TOKEN_KEY, refresh);
    //         }
    //
    //         setToken(access);
    //
    //         // Optionally fetch user profile
    //         try {
    //             const u = await apiFetch<unknown>('/me');
    //             setUser(u);
    //         } catch {
    //             setUser(null);
    //         }
    //     } catch (e: unknown) {
    //         const msg = e instanceof Error ? e.message : 'Login failed';
    //         setError(msg);
    //         throw e; // rethrow so callers can handle
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const logout: AuthValue['logout'] = async () => {
        await storage.deleteItem(ACCESS_TOKEN_KEY);
        await storage.deleteItem(REFRESH_TOKEN_KEY);
        setUser(null);
        setToken(null);
    };

    const value = useMemo<AuthValue>(
        () => ({ token, login, logout, user, loading, error }),
        [token, user, loading, error]
    );

    return (
        <InternalAuthContext.Provider value={value}>
            {children}
        </InternalAuthContext.Provider>
    );
}

export function useAuth(): AuthValue {
    const ctx = useContext(InternalAuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider />');
    return ctx;
}
