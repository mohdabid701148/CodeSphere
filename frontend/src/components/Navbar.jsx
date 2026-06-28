import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigate('/login');
  };

  return (
    <>
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
            <Link to="/company-kit" className="text-slate-600 hover:text-slate-900 transition text-sm font-medium">
              Company Kit
            </Link>
            <Link to="/connect" className="text-slate-600 hover:text-slate-900 transition text-sm font-medium">
              Connect
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <span className="text-slate-700 text-sm font-semibold">{user?.name || 'Developer'}</span>
              <button
                onClick={() => setShowLogoutModal(true)}
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

    {showLogoutModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Confirm Logout</h3>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to log out of your Codesphere account?</p>
            <div className="flex w-full gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition shadow-md shadow-red-600/20"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
