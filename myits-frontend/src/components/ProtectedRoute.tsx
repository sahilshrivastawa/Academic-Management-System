import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRole, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const normalizedUserRole = (user?.role || '').replace('ROLE_', '');
  const normalizedRequiredRole = requiredRole?.replace('ROLE_', '');
  const normalizedAllowedRoles = allowedRoles?.map((role) => role.replace('ROLE_', ''));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (normalizedRequiredRole && normalizedUserRole !== normalizedRequiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  if (normalizedAllowedRoles && normalizedAllowedRoles.length > 0 && (!normalizedUserRole || !normalizedAllowedRoles.includes(normalizedUserRole))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
