import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-green-600" size={48} />
            </div>
        );
    }

    if (!user) {
        // Redirect based on the required role for this route
        if (allowedRoles.includes('farmer')) {
            return <Navigate to="/login/farmer" replace />;
        }
        if (allowedRoles.includes('buyer')) {
            return <Navigate to="/login/buyer" replace />;
        }
        return <Navigate to="/" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        // If logged in but wrong role, redirect to their own dashboard
        if (role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
        if (role === 'buyer') return <Navigate to="/buyer/dashboard" replace />;

        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
