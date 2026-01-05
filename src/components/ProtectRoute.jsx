import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');

  // Si pas de token → redirection vers /auth
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // Si connecté → afficher la page protégée (HomePage)
  return <Outlet />;
}