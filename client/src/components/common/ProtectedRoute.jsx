import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // If not authenticated in memory, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is not authorized, redirect to their respective home
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
    if (role === 'normal_user') return <Navigate to="/stores" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
