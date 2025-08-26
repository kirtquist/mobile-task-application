import React, {
    createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../lib/config";

type User = {
    username: string;
    email: string;
};

type AuthValue = {
    token: string | null;
    user: unknown | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthValue | null>(null);

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const storage = {
    getItem: async (k: string) =>
        Platform.OS === "web"
            ? (typeof window !== "undefined" ? window.localStorage.getItem(k) : null)
            : SecureStore.getItemAsync(k),
    setItem: async (k: string, v: string) =>
        Platform.OS === "web"
            ? void (typeof window !== "undefined" && window.localStorage.setItem(k, v))
            : SecureStore.setItemAsync(k, v),
    removeItem: async (k: string) =>
        Platform.OS === "web"
            ? void (typeof window !== "undefined" && window.localStorage.removeItem(k))
            : SecureStore.deleteItemAsync(k),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<unknown | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Hydrate token on app start
    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const t = await storage.getItem(ACCESS_TOKEN_KEY);
                if (alive && t) setToken(t);
            } catch (e) {
                if (alive) setError(String(e));
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    const refreshUser = useCallback(async () => {
        if (!token) {
            setUser(null);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/me`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                // If the token is invalid/expired, you may choose to logout here
                throw new Error(`Failed to load profile (${res.status})`);
            }
            const json = (await res.json()) as User;
            setUser(json);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load profile');
            // Optionally clear user on error
            setUser(null);
        }
    }, [token]);

    // Whenever token changes (e.g., login, app reload), fetch /me
    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (!token) {
                setUser(null);
                return;
            }
            try {
                await refreshUser();
            } catch {
                // handled in refreshUser
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token, refreshUser]);


    const login = useCallback(async (username: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/token/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            if (!res.ok) throw new Error(await res.text());
            const { access, refresh } = await res.json();
            await storage.setItem(ACCESS_TOKEN_KEY, access);
            if (refresh) await storage.setItem(REFRESH_TOKEN_KEY, refresh);
            setToken(access);
            // Optionally: fetch user profile and setUser(...)
        } catch (e: any) {
            setError(e?.message ?? "Login failed");
            setToken(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        await storage.removeItem(ACCESS_TOKEN_KEY);
        await storage.removeItem(REFRESH_TOKEN_KEY);
        setUser(null);
        setToken(null);
    }, []);

    const value = useMemo<AuthValue>(() => ({
        token,
        user,
        loading,
        error,
        refreshUser,
        isAuthenticated: !!token,
        login,
        logout,
    }), [token, user, loading, error, login, logout]);

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthValue {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
    return ctx;
}
