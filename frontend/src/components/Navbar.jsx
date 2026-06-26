import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-950/40 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/30 px-6 py-4 rounded-b-2xl mb-8 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-3 group">
        <Logo size={32} className="group-hover:scale-105 transition-transform duration-300" />
        <span className="text-xl font-extrabold font-display tracking-tight text-white">
          Code<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Sphere</span>
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
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition text-sm shadow-lg shadow-indigo-500/10"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
