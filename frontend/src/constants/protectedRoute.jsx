// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading, hasRole } = useAuth();
  const location = useLocation();

  console.log(`ProtectedRoute (${location.pathname}): Evaluating. isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}`);
  console.log(`ProtectedRoute (${location.pathname}): User object:`, JSON.stringify(user));
  console.log(`ProtectedRoute (${location.pathname}): Allowed roles for this route:`, JSON.stringify(allowedRoles));

  if (isLoading) {
    console.log(`ProtectedRoute (${location.pathname}): Auth state is loading...`);
    return <div>Loading Session...</div>; // Or your preferred loading indicator
  }

  if (!isAuthenticated) {
    console.log(`ProtectedRoute (${location.pathname}): Not authenticated. Redirecting to login.`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access check
  if (allowedRoles && allowedRoles.length > 0) {
    const userHasRequiredRole = hasRole(allowedRoles); // Call hasRole
    if (!userHasRequiredRole) {
      console.warn(`ProtectedRoute (${location.pathname}): User ${user?.email} with roles ${JSON.stringify(user?.roles)} does NOT have required roles: ${JSON.stringify(allowedRoles)}. Redirecting to home.`);
      return <Navigate to="/" state={{ from: location }} replace />;
    } else {
      console.log(`ProtectedRoute (${location.pathname}): User has required role(s). Access granted.`);
    }
  } else {
    console.log(`ProtectedRoute (${location.pathname}): No specific roles required (or allowedRoles not provided). Access granted as user is authenticated.`);
  }

  return <Outlet />;
};

export default ProtectedRoute;