import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-t-2 border-b-2 border-purple-500 animate-spin"></div>
          <div className="absolute w-10 h-10 rounded-full border-r-2 border-l-2 border-cyan-400 animate-pulse"></div>
        </div>
        <p className="mt-6 text-gray-400 text-sm font-medium tracking-wide animate-pulse">
          Authenticating session...
        </p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
