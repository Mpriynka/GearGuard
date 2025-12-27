import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            // Ideally we would validate token or fetch user profile here.
            // For now, we assume token means logged in.
            // Can decode JWT to get username/role if needed.
            try {
                // simple decode for role if needed
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ username: payload.sub, role: payload.role });
            } catch (e) {
                logout();
            }
        }
    }, [token]);

    const login = async (username, password) => {
        setLoading(true);
        try {
            const data = await authService.login(username, password);
            localStorage.setItem('token', data.access_token);
            setToken(data.access_token);
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const register = async (userData) => {
        setLoading(true);
        try {
            await authService.register(userData);
            return true;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
