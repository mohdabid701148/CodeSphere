import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  // We'll read from localStorage directly in Phase 0, then shift to AuthContext in Phase 1
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload(); // Quick refresh to update state
  };

  return (
    <nav className="glass-panel border-b border-white/5 px-6 py-4 rounded-b-2xl mb-8 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center font-extrabold text-white text-lg">
          C
        </span>
        <span className="text-xl font-bold font-display tracking-tight text-white">
          Code<span className="text-purple-400">Sphere</span>
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/" className="text-gray-300 hover:text-white transition text-sm font-medium">
          Home
        </Link>
        {token ? (
          <>
            <Link to="/dashboard" className="text-gray-300 hover:text-white transition text-sm font-medium">
              Dashboard
            </Link>
            <Link to="/connect" className="text-gray-300 hover:text-white transition text-sm font-medium">
              Connect
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <span className="text-gray-300 text-sm font-semibold">{user?.name || 'Developer'}</span>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-semibold hover:bg-red-500/25 hover:text-white transition duration-200 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition text-sm"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
