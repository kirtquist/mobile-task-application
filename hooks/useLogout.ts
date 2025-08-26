// useLogout.ts
import React from "react";

export const useLogout = (
    setUser: React.Dispatch<React.SetStateAction<{ username: string; email: string } | null>>,
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
) => {


    return () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/login';
    };
};