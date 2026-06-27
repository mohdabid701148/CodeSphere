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
    <nav className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-sm shadow-slate-100/50 px-6 py-4 rounded-b-2xl mb-8 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-3 group">
        <Logo size={32} />
        <span className="text-xl font-extrabold font-display tracking-tight text-slate-900">
          Code<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">Sphere</span>
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/" className="text-slate-600 hover:text-slate-900 transition text-sm font-medium">
          Home
        </Link>
        {token ? (
          <>
            <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 transition text-sm font-medium">
              Dashboard
            </Link>
            <Link to="/events" className="text-slate-600 hover:text-slate-900 transition text-sm font-medium">
              Events
            </Link>
            <Link to="/connect" className="text-slate-600 hover:text-slate-900 transition text-sm font-medium">
              Connect
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <span className="text-slate-700 text-sm font-semibold">{user?.name || 'Developer'}</span>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 hover:text-red-700 transition duration-200 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition text-sm shadow-md shadow-indigo-600/10"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
