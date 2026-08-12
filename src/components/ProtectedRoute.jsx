// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
  const token = localStorage.getItem('@EliteTickets:token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}