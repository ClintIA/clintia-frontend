import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {useAuth} from "@/hooks/auth.tsx";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    if (!isAuthenticated) {
        return <Navigate to="/login/admin" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
