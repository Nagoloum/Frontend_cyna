import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RouteLayout({ children, requireAuth = false, allowedRoles = [] }) {
  const location = useLocation();

  if (!requireAuth) return <>{children}</>;

  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/auth" replace state={{ from: location }} />;

  if (allowedRoles.length > 0) {
    const userStr = localStorage.getItem('user');
    if (!userStr) return <Navigate to="/auth" replace state={{ from: location }} />;

    try {
      const user = JSON.parse(userStr);
      const role = user?.role;
      if (!role || !allowedRoles.includes(role)) return <Navigate to="/home" replace />;
    } catch {
      return <Navigate to="/auth" replace state={{ from: location }} />;
    }
  }

  return <>{children}</>;
}
