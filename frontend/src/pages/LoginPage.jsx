import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, token } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  // Extract OAuth callback parameters from URL query string
  useEffect(() => {
    const queryAccessToken = searchParams.get('accessToken');
    const queryRefreshToken = searchParams.get('refreshToken');
    const queryUser = searchParams.get('user');
    const queryError = searchParams.get('error');

    if (queryError) {
      setErrorMsg(decodeURIComponent(queryError));
    }

    if (queryAccessToken && queryRefreshToken && queryUser && !token) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(queryUser));
        login(queryAccessToken, queryRefreshToken, parsedUser);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Failed to parse redirected user data', err);
        setErrorMsg('Failed to process login data.');
      }
    }
  }, [searchParams, token, login, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/80 max-w-md w-full p-8 rounded-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size={64} />
          </div>
          <h2 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">Welcome to CodeSphere</h2>
          <p className="text-slate-600 text-sm">
            Sign in to aggregate your coding profiles and build your portfolio.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4 pt-2">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.96 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-slate-400 text-xs leading-relaxed">
            By signing in, you agree to our Terms of Service <br />
            and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
