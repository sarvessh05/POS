import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardRedirect = () => {
    const { user } = useAuth();

    // Redirect sysadmin to System Dashboard
    if (user?.role === 'sysadmin') {
        return <Navigate to="/system" replace />;
    }

    // Regular admin goes to Dashboard
    return <Navigate to="/dashboard" replace />;
};

export default DashboardRedirect;
