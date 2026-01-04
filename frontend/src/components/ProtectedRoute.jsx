import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="flex bg-[var(--bg-color)] h-screen">
            <Sidebar />
            <div className="main-content w-full overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default ProtectedRoute;
