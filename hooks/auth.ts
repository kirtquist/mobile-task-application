// import {useAuth} from "@/contexts/AuthContext";
import {useAuth} from "@/hooks/useAuth";
import {useState} from "react";

type LoginCredentials = {
    username: string;
    password: string;
};

export function useLoginHandler() {
    const { login: signIn ,logout: signOut} = useAuth(); // or: const { login: signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleLogin = async ({ username, password }: LoginCredentials) => {
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            // Adjust this call to match your hook’s API:
            // Option A (object):
            await signIn(username, password );
            setIsAuthenticated(true);
            // Option B (separate args):
            // await signIn(username, password);
        } catch (e) {
            setError('Login failed. Please check your credentials and try again.');
            // Optionally rethrow or handle specific error codes here
        } finally {
            setLoading(false);
        }
    };

    return { handleLogin, loading, error };

    const handleLogout = async () => { await signOut(); };
}