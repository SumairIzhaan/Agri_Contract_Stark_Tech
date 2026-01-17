import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';


const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">

            </div>
        );
    }

    if (!user) {
        // Redirect them to the login page, but save the current location they were
        // trying to go to when they were redirected.
        // For general proection, maybe just go to home or specific login
        return <Navigate to="/" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
