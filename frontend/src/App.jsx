import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IntegrationsPage from './pages/IntegrationsPage';
import PublicProfilePage from './pages/PublicProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="max-w-6xl mx-auto px-4 pb-12 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/connect" 
              element={
                <ProtectedRoute>
                  <IntegrationsPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/profile/:slug" element={<PublicProfilePage />} />
          </Routes>
        </main>
        <footer className="mt-16 text-center text-gray-500 text-xs py-4 border-t border-white/5">
          &copy; {new Date().getFullYear()} CodeSphere. Built for developer portfolios.
        </footer>
      </div>
    </Router>
  );
}

export default App;
