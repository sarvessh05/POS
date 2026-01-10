import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await api.get('/users/me');
                setUser(response.data);
            } catch (error) {
                console.error("Failed to fetch user", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            console.log('=== LOGIN ATTEMPT ===');
            console.log('API Base URL:', api.defaults.baseURL);
            console.log('Username:', username);
            console.log('Password length:', password.length);
            
            const response = await api.post('/token', formData);
            
            console.log('=== LOGIN SUCCESS ===');
            console.log('Access token received:', response.data.access_token ? 'Yes' : 'No');
            
            localStorage.setItem('token', response.data.access_token);
            await fetchUser();
            return true;
        } catch (error) {
            console.error("=== LOGIN FAILED ===");
            console.error("Error type:", error.constructor.name);
            console.error("Error message:", error.message);
            
            if (error.response) {
                console.error("Response received from server:");
                console.error("  Status:", error.response.status);
                console.error("  Data:", error.response.data);
            } else if (error.request) {
                console.error("No response received from server");
                console.error("  Request was made to:", error.config?.url);
                console.error("  Request details:", error.request);
            } else {
                console.error("Error setting up request:", error.message);
            }
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
